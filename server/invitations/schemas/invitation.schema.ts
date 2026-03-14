import { z } from "zod";

export const sendInvitationSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  userId: z.string().min(1, "User ID is required"),
});
