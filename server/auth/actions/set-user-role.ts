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

    await userService.assertRoleChangeAllowed(session.user.id);

    await authRepository.updateUserRole(session.user.id, role, true);
    revalidatePath("/", "layout");
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to set user role";
    console.error("Failed to set user role:", error);
    return { success: false, error: message };
  }
}
