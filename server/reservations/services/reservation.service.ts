import { prisma } from "@/lib/prisma";
import { authService } from "@/server/auth/services/auth.service";
import { tableRepository } from "@/server/tables/repositories/table.repository";
import { restaurantRepository } from "@/server/restaurants/repositories/restaurant.repository";
import { notificationService } from "@/server/notifications/services/notification.service";
import { reservationRepository } from "../repositories/reservation.repository";
import { formatTimeInAppTz, getDayOfWeekInAppTz } from "@/lib/date-utils";
import type { CreateReservationInput } from "../types";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED", "COMPLETED", "NO_SHOW"],
};

async function autoCompleteExpired() {
  await prisma.reservation.updateMany({
    where: {
      status: "CONFIRMED",
      endTime: { lt: new Date() },
    },
    data: { status: "COMPLETED" },
  });
}

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

    notificationService
      .notifyRestaurantStaff(
        data.restaurantId,
        "New Reservation",
        `${session.user.name} requested a reservation for ${data.guestCount} guests.`,
        "reservation_created",
        `/dashboard/${data.restaurantId}`,
      )
      .catch(() => {});

    return reservation;
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
      notificationService
        .create(
          reservation.userId,
          "Reservation Updated",
          `Your reservation at ${reservation.restaurant.name} has been ${label}.`,
          "reservation_status",
          `/reservations`,
        )
        .catch(() => {});
    }

    return result;
  },

  async findByUserId() {
    const session = await authService.requireAuth();
    await autoCompleteExpired();
    return reservationRepository.findByUserId(session.user.id);
  },

  async findByRestaurantId(restaurantId: string, filters?: { from?: Date; to?: Date }) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantAccess(session.user.id, restaurantId);
    await autoCompleteExpired();
    return reservationRepository.findByRestaurantId(restaurantId, filters);
  },
};
