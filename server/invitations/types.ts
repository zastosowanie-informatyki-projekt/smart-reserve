import type { z } from "zod";
import type { sendInvitationSchema } from "./schemas/invitation.schema";

export type SendInvitationInput = z.infer<typeof sendInvitationSchema>;
