"use server";

import type { ActionResult } from "@/lib/types";
import { notificationService } from "../services/notification.service";

export async function markNotificationRead(id: string): Promise<ActionResult> {
  try {
    await notificationService.markAsRead(id);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}
