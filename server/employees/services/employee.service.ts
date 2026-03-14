import { authService } from "@/server/auth/services/auth.service";
import { employeeRepository } from "../repositories/employee.repository";

export const employeeService = {
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

  async getMyRestaurants() {
    const session = await authService.requireAuth();
    return employeeRepository.findRestaurantsByUserId(session.user.id);
  },
};
