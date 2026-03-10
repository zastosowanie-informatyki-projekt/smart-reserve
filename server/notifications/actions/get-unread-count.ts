"use server";

import type { ActionResult } from "@/lib/types";
import { authService } from "@/server/auth/services/auth.service";
import { notificationService } from "../services/notification.service";

export async function getUnreadCount(): Promise<ActionResult<number>> {
  try {
    const session = await authService.requireAuth();
    const count = await notificationService.getUnreadCount(session.user.id);
    return { success: true, data: count };
  } catch (error) {
    console.error("Failed to get unread count:", error);
    return { success: false, error: "Failed to get unread count" };
  }
}
