"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types";
import { authService } from "../services/auth.service";

export async function setUserRole(
  role: "USER" | "RESTAURANT_OWNER" | "EMPLOYEE",
): Promise<ActionResult> {
  try {
    const session = await authService.requireAuth();

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role, onboarded: true },
    });

    revalidatePath("/", "layout");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to set user role:", error);
    return { success: false, error: "Failed to set user role" };
  }
}
