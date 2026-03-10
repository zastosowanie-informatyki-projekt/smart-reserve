import { authService } from "@/server/auth/services/auth.service";
import { tableRepository } from "@/server/tables/repositories/table.repository";
import { restaurantRepository } from "@/server/restaurants/repositories/restaurant.repository";
import { reservationRepository } from "../repositories/reservation.repository";
import { formatTimeInAppTz, getDayOfWeekInAppTz } from "@/lib/date-utils";
import type { CreateReservationInput } from "../types";

export const reservationService = {
  async create(data: CreateReservationInput) {
    const session = await authService.requireAuth();

    if (data.startTime >= data.endTime) {
      throw new Error("Start time must be before end time");
    }

    if (data.startTime < new Date()) {
      throw new Error("Cannot make a reservation in the past");
    }

    const table = await tableRepository.findById(data.tableId);
    if (!table) {
      throw new Error("Table not found");
    }
    if (!table.isActive) {
      throw new Error("This table is not available");
    }
    if (data.guestCount > table.capacity) {
      throw new Error(`Guest count exceeds table capacity of ${table.capacity}`);
    }

    const openingHours = await restaurantRepository.findOpeningHours(data.restaurantId);
    if (openingHours.length > 0) {
      const adjustedDay = getDayOfWeekInAppTz(data.startTime);
      const dayHours = openingHours.find((h) => h.dayOfWeek === adjustedDay);

      if (dayHours?.isClosed) {
        throw new Error("Restaurant is closed on this day");
      }

      if (dayHours) {
        const startTimeStr = formatTimeInAppTz(data.startTime);
        const endTimeStr = formatTimeInAppTz(data.endTime);
        if (startTimeStr < dayHours.openTime || endTimeStr > dayHours.closeTime) {
          throw new Error(
            `Reservation must be within opening hours: ${dayHours.openTime} - ${dayHours.closeTime}`,
          );
        }
      }
    }

    const overlap = await reservationRepository.findOverlapping(data.tableId, data.startTime, data.endTime);
    if (overlap) {
      throw new Error("This table is already reserved for the selected time");
    }

    return reservationRepository.create({
      ...data,
      userId: session.user.id,
    });
  },

  async cancel(id: string) {
    const session = await authService.requireAuth();
    const reservation = await reservationRepository.findById(id);

    if (!reservation) {
      throw new Error("Reservation not found");
    }
    if (reservation.userId !== session.user.id) {
      throw new Error("You can only cancel your own reservations");
    }
    if (reservation.status === "CANCELLED") {
      throw new Error("Reservation is already cancelled");
    }
    if (reservation.status === "COMPLETED") {
      throw new Error("Cannot cancel a completed reservation");
    }

    return reservationRepository.updateStatus(id, "CANCELLED");
  },

  async updateStatus(id: string, status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW") {
    const session = await authService.requireAuth();
    const reservation = await reservationRepository.findById(id);

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    await authService.requireRestaurantOwner(session.user.id, reservation.restaurantId);

    return reservationRepository.updateStatus(id, status);
  },

  async findByUserId() {
    const session = await authService.requireAuth();
    return reservationRepository.findByUserId(session.user.id);
  },

  async findByRestaurantId(restaurantId: string, filters?: { from?: Date; to?: Date }) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, restaurantId);
    return reservationRepository.findByRestaurantId(restaurantId, filters);
  },
};
