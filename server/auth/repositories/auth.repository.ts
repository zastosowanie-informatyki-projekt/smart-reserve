import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/app/generated/prisma/client";

export const authRepository = {
  async updateUserRole(userId: string, role: UserRole, onboarded: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { role, onboarded },
      select: { id: true, role: true, onboarded: true },
    });
  },
};
