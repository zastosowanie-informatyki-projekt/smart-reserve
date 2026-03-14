import { prisma } from "@/lib/prisma";

export const employeeRepository = {
  async findByRestaurantId(restaurantId: string) {
    return prisma.restaurantEmployee.findMany({
      where: { restaurantId },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async removeEmployee(id: string) {
    return prisma.restaurantEmployee.delete({
      where: { id },
      select: { userId: true, restaurantId: true },
    });
  },

  async existsByEmailAndRestaurant(email: string, restaurantId: string) {
    const record = await prisma.restaurantEmployee.findFirst({
      where: {
        restaurantId,
        user: { email },
      },
      select: { id: true },
    });
    return record !== null;
  },

  async existsByUserAndRestaurant(userId: string, restaurantId: string) {
    const record = await prisma.restaurantEmployee.findUnique({
      where: { userId_restaurantId: { userId, restaurantId } },
      select: { id: true },
    });
    return record !== null;
  },

  async createWithRoleUpdate(userId: string, restaurantId: string) {
    await prisma.$transaction([
      prisma.restaurantEmployee.create({
        data: { userId, restaurantId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { role: "EMPLOYEE" },
      }),
    ]);
  },

  async findRestaurantsByUserId(userId: string) {
    return prisma.restaurantEmployee.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            city: true,
            cuisine: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
