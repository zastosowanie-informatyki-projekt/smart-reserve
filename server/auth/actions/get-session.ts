"use server";

import type { ActionResult } from "@/lib/types";
import { authService } from "../services/auth.service";
import type { Session } from "../types";

export async function getSession(): Promise<ActionResult<Session | null>> {
  try {
    const session = await authService.getSession();
    return { success: true, data: session };
  } catch (error) {
    console.error("Failed to get session:", error);
    return { success: false, error: "Failed to get session" };
  }
}
