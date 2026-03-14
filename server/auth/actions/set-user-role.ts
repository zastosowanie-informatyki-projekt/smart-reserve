"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { authService } from "../services/auth.service";
import { authRepository } from "../repositories/auth.repository";

export async function setUserRole(
  role: "USER" | "RESTAURANT_OWNER" | "EMPLOYEE",
): Promise<ActionResult> {
  try {
    const session = await authService.requireAuth();
    await authRepository.updateUserRole(session.user.id, role, true);
    revalidatePath("/", "layout");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to set user role:", error);
    return { success: false, error: "Failed to set user role" };
  }
}
