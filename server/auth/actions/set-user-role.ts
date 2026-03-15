"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { authService } from "../services/auth.service";
import { authRepository } from "../repositories/auth.repository";
import { userService } from "@/server/users/services/user.service";

export async function setUserRole(
  role: "USER" | "RESTAURANT_OWNER" | "EMPLOYEE",
): Promise<ActionResult> {
  try {
    const session = await authService.requireAuth();

    const alreadyOnboarded = await userService.isOnboarded(session.user.id);
    if (alreadyOnboarded) {
      return { success: false, error: "Role has already been set and cannot be changed." };
    }

    await authRepository.updateUserRole(session.user.id, role, true);
    revalidatePath("/", "layout");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to set user role:", error);
    return { success: false, error: "Failed to set user role" };
  }
}
