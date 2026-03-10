import { z } from "zod";

export const createRoomSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  name: z.string().min(1, "Room name is required"),
  description: z.string().optional(),
});

export const updateRoomSchema = z.object({
  id: z.string().min(1, "Room ID is required"),
  name: z.string().min(1, "Room name is required").optional(),
  description: z.string().optional(),
});
