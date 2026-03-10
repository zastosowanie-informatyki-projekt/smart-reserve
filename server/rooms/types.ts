import type { z } from "zod";
import type { createRoomSchema, updateRoomSchema } from "./schemas/room.schema";

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
