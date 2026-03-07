import { z } from "zod";

export const createTableSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  label: z.string().min(1, "Label is required"),
  capacity: z.number().int().positive("Capacity must be a positive number"),
  description: z.string().optional(),
});

export const updateTableSchema = z.object({
  id: z.string().min(1, "Table ID is required"),
  label: z.string().min(1, "Label is required").optional(),
  capacity: z.number().int().positive("Capacity must be a positive number").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});
