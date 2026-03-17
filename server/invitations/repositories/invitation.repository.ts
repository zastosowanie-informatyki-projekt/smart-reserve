import { prisma } from "@/lib/prisma";

export const invitationRepository = {
  async create(data: { restaurantId: string; userId: string }) {
    return prisma.employeeInvitation.create({
      data,
      select: {
        id: true,
        userId: true,
        createdAt: true,
        restaurant: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.employeeInvitation.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        restaurantId: true,
        acceptedAt: true,
        declinedAt: true,
        createdAt: true,
        restaurant: { select: { id: true, name: true, ownerId: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async findByRestaurantId(restaurantId: string) {
    return prisma.employeeInvitation.findMany({
      where: {
        restaurantId,
        acceptedAt: null,
        declinedAt: null,
      },
      select: {
        id: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findPendingByUser(userId: string) {
    return prisma.employeeInvitation.findMany({
      where: {
        userId,
        acceptedAt: null,
        declinedAt: null,
      },
      select: {
        id: true,
        createdAt: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            city: true,
            cuisines: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findPendingByUserAndRestaurant(userId: string, restaurantId: string) {
    return prisma.employeeInvitation.findFirst({
      where: {
        userId,
        restaurantId,
        acceptedAt: null,
        declinedAt: null,
      },
      select: { id: true },
    });
  },

  async accept(id: string) {
    return prisma.employeeInvitation.update({
      where: { id },
      data: { acceptedAt: new Date() },
      select: { id: true, userId: true, restaurantId: true },
    });
  },

  async decline(id: string) {
    return prisma.employeeInvitation.update({
      where: { id },
      data: { declinedAt: new Date() },
      select: { id: true },
    });
  },

  async revoke(id: string) {
    return prisma.employeeInvitation.delete({
      where: { id },
      select: { id: true },
    });
  },

  async searchUsersToInvite(query: string, restaurantId: string) {
    return prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
        employeeAt: { none: { restaurantId } },
        receivedInvitations: {
          none: { restaurantId, acceptedAt: null, declinedAt: null },
        },
      },
      select: { id: true, name: true, email: true, image: true },
      take: 10,
    });
  },
};
