import { prisma } from "@/lib/prisma";

export const userRepository = {
  async findRoleById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
  },

  async findOnboardedById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { onboarded: true },
    });
  },
};
