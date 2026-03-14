"use server";

import type { ActionResult } from "@/lib/types";
import { authService } from "@/server/auth/services/auth.service";
import { notificationService } from "../services/notification.service";

export async function markNotificationRead(id: string): Promise<ActionResult> {
  try {
    const session = await authService.requireAuth();
    await notificationService.markAsRead(id, session.user.id);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}
