import type { z } from "zod";
import type {
  createReservationSchema,
  updateReservationStatusSchema,
} from "./schemas/reservation.schema";

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusInput = z.infer<
  typeof updateReservationStatusSchema
>;
