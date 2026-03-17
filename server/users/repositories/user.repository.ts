import { prisma } from "@/lib/prisma";

export const userRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { role: true, onboarded: true },
    });
  },

  async findRoleById(id: string) {
    return this.findById(id);
  },

  async findOnboardedById(id: string) {
    return this.findById(id);
  },
};
