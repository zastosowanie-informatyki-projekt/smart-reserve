import { prisma } from "@/lib/prisma";

export const photoRepository = {
  async create(data: { url: string; altText?: string; restaurantId: string }) {
    const maxOrder = await prisma.restaurantPhoto.aggregate({
      where: { restaurantId: data.restaurantId },
      _max: { order: true },
    });

    return prisma.restaurantPhoto.create({
      data: {
        ...data,
        order: (maxOrder._max.order ?? -1) + 1,
      },
      select: {
        id: true,
        url: true,
        altText: true,
        order: true,
        restaurantId: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.restaurantPhoto.delete({
      where: { id },
      select: { id: true, url: true, restaurantId: true },
    });
  },

  async findById(id: string) {
    return prisma.restaurantPhoto.findUnique({
      where: { id },
      select: {
        id: true,
        url: true,
        altText: true,
        restaurantId: true,
      },
    });
  },

  async findByRestaurantId(restaurantId: string) {
    return prisma.restaurantPhoto.findMany({
      where: { restaurantId },
      select: {
        id: true,
        url: true,
        altText: true,
        order: true,
      },
      orderBy: { order: "asc" },
    });
  },
};
