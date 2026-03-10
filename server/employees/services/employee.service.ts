import { prisma } from "@/lib/prisma";
import { authService } from "@/server/auth/services/auth.service";
import { notificationService } from "@/server/notifications/services/notification.service";
import { employeeRepository } from "../repositories/employee.repository";

export const employeeService = {
  async searchEmployees(query: string, restaurantId: string) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, restaurantId);

    if (!query || query.length < 2) {
      return [];
    }

    return employeeRepository.searchAvailableEmployees(query, restaurantId);
  },

  async addEmployee(userId: string, restaurantId: string) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, restaurantId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "EMPLOYEE") {
      throw new Error("User is not registered as an employee");
    }

    const record = await employeeRepository.addEmployee(userId, restaurantId);

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { name: true },
    });

    await notificationService.create(
      userId,
      "Added to Restaurant",
      `You have been added as an employee at ${restaurant?.name ?? "a restaurant"}.`,
      "employee_added",
      `/dashboard/${restaurantId}`,
    );

    return record;
  },

  async getEmployees(restaurantId: string) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, restaurantId);
    return employeeRepository.findByRestaurantId(restaurantId);
  },

  async removeEmployee(employeeRecordId: string, restaurantId: string) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, restaurantId);
    return employeeRepository.removeEmployee(employeeRecordId);
  },
};
