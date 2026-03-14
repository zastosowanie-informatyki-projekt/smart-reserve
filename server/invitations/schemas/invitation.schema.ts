import { z } from "zod";

export const sendInvitationSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  email: z.string().email("Invalid email address"),
});
