"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { sendInvitationSchema } from "../schemas/invitation.schema";
import { invitationService } from "../services/invitation.service";

export async function sendInvitation(
  formData: FormData,
): Promise<ActionResult<{ token: string }>> {
  const parsed = sendInvitationSchema.safeParse({
    restaurantId: formData.get("restaurantId"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const invitation = await invitationService.send(parsed.data);
    revalidatePath(`/dashboard/${parsed.data.restaurantId}`);
    return { success: true, data: { token: invitation.token } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send invitation";
    console.error("Failed to send invitation:", error);
    return { success: false, error: message };
  }
}
