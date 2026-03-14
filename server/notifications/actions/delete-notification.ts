"use server";

import type { ActionResult } from "@/lib/types";
import { authService } from "@/server/auth/services/auth.service";
import { notificationService } from "../services/notification.service";

export async function deleteNotification(id: string): Promise<ActionResult> {
  try {
    const session = await authService.requireAuth();
    await notificationService.delete(id, session.user.id);
    return { success: true, data: undefined };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete notification";
    console.error("Failed to delete notification:", error);
    return { success: false, error: message };
  }
}
