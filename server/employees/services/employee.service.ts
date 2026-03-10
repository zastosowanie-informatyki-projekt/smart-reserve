import { prisma } from "@/lib/prisma";
import { authService } from "@/server/auth/services/auth.service";
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

    return employeeRepository.addEmployee(userId, restaurantId);
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
