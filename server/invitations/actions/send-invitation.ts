"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { sendInvitationSchema } from "../schemas/invitation.schema";
import { invitationService } from "../services/invitation.service";

export async function sendInvitation(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = sendInvitationSchema.safeParse({
    restaurantId: formData.get("restaurantId"),
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const invitation = await invitationService.send(parsed.data);
    revalidatePath(`/dashboard/${parsed.data.restaurantId}`);
    return { success: true, data: { id: invitation.id } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send invitation";
    console.error("Failed to send invitation:", error);
    return { success: false, error: message };
  }
}
