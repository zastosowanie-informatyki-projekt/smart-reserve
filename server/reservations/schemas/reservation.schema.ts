import { z } from "zod";

export const createReservationSchema = z.object({
  tableId: z.string().min(1, "Table ID is required"),
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  startTime: z.coerce.date({ error: "Start time is required" }),
  endTime: z.coerce.date({ error: "End time is required" }),
  guestCount: z.number().int().positive("Guest count must be at least 1"),
  notes: z.string().optional(),
});

export const updateReservationStatusSchema = z.object({
  id: z.string().min(1, "Reservation ID is required"),
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]),
});

export const updateReservationSchema = z.object({
  id: z.string().min(1, "Reservation ID is required"),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  guestCount: z.number().int().positive("Guest count must be at least 1").optional(),
  notes: z.string().optional(),
});
