import { prisma } from "@/lib/prisma";

export const employeeRepository = {
  async searchAvailableEmployees(query: string, restaurantId: string) {
    return prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
        employeeAt: {
          none: { restaurantId },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10,
    });
  },

  async addEmployee(userId: string, restaurantId: string) {
    return prisma.restaurantEmployee.create({
      data: { userId, restaurantId },
      select: {
        id: true,
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },

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
};
