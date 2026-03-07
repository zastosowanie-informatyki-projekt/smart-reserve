import type { z } from "zod";
import type {
  createRestaurantSchema,
  updateRestaurantSchema,
  setOpeningHoursSchema,
} from "./schemas/restaurant.schema";

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
export type SetOpeningHoursInput = z.infer<typeof setOpeningHoursSchema>;
