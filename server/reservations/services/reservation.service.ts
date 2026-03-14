import { authService } from "@/server/auth/services/auth.service";
import { tableRepository } from "@/server/tables/repositories/table.repository";
import { restaurantRepository } from "@/server/restaurants/repositories/restaurant.repository";
import { notificationService } from "@/server/notifications/services/notification.service";
import { reservationRepository } from "../repositories/reservation.repository";
import { formatTimeInAppTz, getDayOfWeekInAppTz } from "@/lib/date-utils";
import type { CreateReservationInput, UpdateReservationInput } from "../types";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED", "COMPLETED", "NO_SHOW"],
};

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
    if (table.room.restaurantId !== data.restaurantId) {
      throw new Error("Table does not belong to this restaurant");
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

    const reservation = await reservationRepository.create({
      ...data,
      userId: session.user.id,
    });

    await notificationService.notifyRestaurantStaff(
      data.restaurantId,
      "New Reservation",
      `${session.user.name} requested a reservation for ${data.guestCount} guests.`,
      "reservation_created",
      `/dashboard/${data.restaurantId}`,
    );

    return reservation;
  },

  async update(data: UpdateReservationInput) {
    const session = await authService.requireAuth();
    const existing = await reservationRepository.findById(data.id);

    if (!existing) {
      throw new Error("Reservation not found");
    }
    if (existing.userId !== session.user.id) {
      throw new Error("You can only edit your own reservations");
    }
    if (existing.status !== "PENDING" && existing.status !== "CONFIRMED") {
      throw new Error("Only pending or confirmed reservations can be edited");
    }

    const startTime = data.startTime ?? existing.startTime;
    const endTime = data.endTime ?? existing.endTime;
    const guestCount = data.guestCount ?? existing.guestCount;

    if (startTime >= endTime) {
      throw new Error("Start time must be before end time");
    }
    if (startTime < new Date()) {
      throw new Error("Cannot set a reservation time in the past");
    }

    const table = await tableRepository.findById(existing.tableId);
    if (!table || !table.isActive) {
      throw new Error("This table is not available");
    }
    if (guestCount > table.capacity) {
      throw new Error(`Guest count exceeds table capacity of ${table.capacity}`);
    }

    const openingHours = await restaurantRepository.findOpeningHours(existing.restaurantId);
    if (openingHours.length > 0) {
      const adjustedDay = getDayOfWeekInAppTz(startTime);
      const dayHours = openingHours.find((h) => h.dayOfWeek === adjustedDay);

      if (dayHours?.isClosed) {
        throw new Error("Restaurant is closed on this day");
      }

      if (dayHours) {
        const startTimeStr = formatTimeInAppTz(startTime);
        const endTimeStr = formatTimeInAppTz(endTime);
        if (startTimeStr < dayHours.openTime || endTimeStr > dayHours.closeTime) {
          throw new Error(
            `Reservation must be within opening hours: ${dayHours.openTime} - ${dayHours.closeTime}`,
          );
        }
      }
    }

    const overlap = await reservationRepository.findOverlapping(
      existing.tableId,
      startTime,
      endTime,
      data.id,
    );
    if (overlap) {
      throw new Error("This table is already reserved for the selected time");
    }

    return reservationRepository.update({ ...data, startTime, endTime, guestCount });
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

    await authService.requireRestaurantAccess(session.user.id, reservation.restaurantId);

    const allowed = VALID_TRANSITIONS[reservation.status];
    if (!allowed || !allowed.includes(status)) {
      throw new Error(
        `Cannot change status from ${reservation.status} to ${status}`,
      );
    }

    const result = await reservationRepository.updateStatus(id, status);

    const statusLabels: Record<string, string> = {
      CONFIRMED: "confirmed",
      CANCELLED: "cancelled",
      NO_SHOW: "marked as no-show",
    };
    const label = statusLabels[status];
    if (label) {
      await notificationService.create(
        reservation.userId,
        "Reservation Updated",
        `Your reservation at ${reservation.restaurant.name} has been ${label}.`,
        "reservation_status",
        `/reservations`,
      );
    }

    return result;
  },

  async findById(id: string) {
    const session = await authService.requireAuth();
    const reservation = await reservationRepository.findById(id);

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    const isGuest = reservation.userId === session.user.id;
    if (!isGuest) {
      await authService.requireRestaurantAccess(session.user.id, reservation.restaurantId);
    }

    return reservation;
  },

  async findByUserId() {
    const session = await authService.requireAuth();
    await reservationRepository.completeExpired();
    return reservationRepository.findByUserId(session.user.id);
  },

  async findByRestaurantId(restaurantId: string, filters?: { from?: Date; to?: Date }) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantAccess(session.user.id, restaurantId);
    await reservationRepository.completeExpired();
    return reservationRepository.findByRestaurantId(restaurantId, filters);
  },
};
