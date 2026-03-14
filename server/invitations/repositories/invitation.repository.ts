import { prisma } from "@/lib/prisma";

export const invitationRepository = {
  async create(data: { restaurantId: string; email: string; expiresAt: Date }) {
    return prisma.employeeInvitation.create({
      data,
      select: {
        id: true,
        email: true,
        token: true,
        expiresAt: true,
        createdAt: true,
        restaurant: { select: { id: true, name: true } },
      },
    });
  },

  async findByToken(token: string) {
    return prisma.employeeInvitation.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        token: true,
        expiresAt: true,
        acceptedAt: true,
        restaurantId: true,
        restaurant: { select: { id: true, name: true } },
      },
    });
  },

  async findByRestaurantId(restaurantId: string) {
    return prisma.employeeInvitation.findMany({
      where: {
        restaurantId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        token: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async accept(id: string) {
    return prisma.employeeInvitation.update({
      where: { id },
      data: { acceptedAt: new Date() },
      select: { id: true, email: true, restaurantId: true },
    });
  },

  async revoke(id: string) {
    return prisma.employeeInvitation.delete({
      where: { id },
      select: { id: true },
    });
  },

  async findPendingByEmailAndRestaurant(email: string, restaurantId: string) {
    return prisma.employeeInvitation.findFirst({
      where: {
        email,
        restaurantId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });
  },
};
