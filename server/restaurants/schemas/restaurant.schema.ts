import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  cuisine: z.string().optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial().extend({
  id: z.string().min(1, "Restaurant ID is required"),
});

const openingHoursEntrySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  isClosed: z.boolean().default(false),
});

export const setOpeningHoursSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  hours: z.array(openingHoursEntrySchema).min(1).max(7),
});
