import { userRepository } from "../repositories/user.repository";
import { reservationRepository } from "@/server/reservations/repositories/reservation.repository";
import { employeeRepository } from "@/server/employees/repositories/employee.repository";
import { restaurantRepository } from "@/server/restaurants/repositories/restaurant.repository";

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    return {
      role: user?.role ?? "USER",
      onboarded: user?.onboarded ?? false,
    };
  },

  async getRole(userId: string) {
    const user = await userRepository.findById(userId);
    return user?.role ?? "USER";
  },

  async isOnboarded(userId: string) {
    const user = await userRepository.findById(userId);
    return user?.onboarded ?? false;
  },

  async assertRoleChangeAllowed(userId: string) {
    const user = await userRepository.findById(userId);
    const currentRole = user?.role ?? "USER";

    if (currentRole === "USER") {
      const activeOrUpcomingReservations =
        await reservationRepository.countActiveOrUpcomingByUserId(userId);
      if (activeOrUpcomingReservations > 0) {
        throw new Error("You cannot change role while you have active or upcoming reservations");
      }
      return;
    }

    if (currentRole === "EMPLOYEE") {
      const employeeAssignments = await employeeRepository.countByUserId(userId);
      if (employeeAssignments > 0) {
        throw new Error("You cannot change role while you are assigned to restaurants as an employee");
      }
      return;
    }

    const ownedRestaurants = await restaurantRepository.countByOwnerId(userId);
    if (ownedRestaurants > 0) {
      throw new Error("You cannot change role while you own restaurants");
    }
  },
};
