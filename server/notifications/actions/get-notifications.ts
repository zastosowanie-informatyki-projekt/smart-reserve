"use server";

import type { ActionResult } from "@/lib/types";
import { authService } from "@/server/auth/services/auth.service";
import { notificationService } from "../services/notification.service";

export async function getNotifications(): Promise<
  ActionResult<
    Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      read: boolean;
      link: string | null;
      createdAt: Date;
    }>
  >
> {
  try {
    const session = await authService.requireAuth();
    const notifications = await notificationService.getForUser(session.user.id);
    return { success: true, data: notifications };
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return { success: false, error: "Failed to get notifications" };
  }
}
