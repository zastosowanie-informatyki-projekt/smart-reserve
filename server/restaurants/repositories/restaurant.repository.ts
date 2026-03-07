import { prisma } from "@/lib/prisma";
import type { CreateRestaurantInput, UpdateRestaurantInput } from "../types";

export const restaurantRepository = {
  async create(data: CreateRestaurantInput & { ownerId: string }) {
    return prisma.restaurant.create({
      data,
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        city: true,
        phone: true,
        email: true,
        imageUrl: true,
        cuisine: true,
        ownerId: true,
        createdAt: true,
      },
    });
  },

  async update(data: UpdateRestaurantInput) {
    const { id, ...rest } = data;
    return prisma.restaurant.update({
      where: { id },
      data: rest,
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        city: true,
        phone: true,
        email: true,
        imageUrl: true,
        cuisine: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.restaurant.delete({ where: { id } });
  },

  async findById(id: string) {
    return prisma.restaurant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        city: true,
        phone: true,
        email: true,
        imageUrl: true,
        cuisine: true,
        ownerId: true,
        createdAt: true,
        openingHours: {
          select: {
            dayOfWeek: true,
            openTime: true,
            closeTime: true,
            isClosed: true,
          },
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });
  },

  async findMany(filters?: { city?: string; cuisine?: string }) {
    return prisma.restaurant.findMany({
      where: {
        ...(filters?.city && { city: { contains: filters.city, mode: "insensitive" as const } }),
        ...(filters?.cuisine && { cuisine: { contains: filters.cuisine, mode: "insensitive" as const } }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        city: true,
        cuisine: true,
        imageUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByOwnerId(ownerId: string) {
    return prisma.restaurant.findMany({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        city: true,
        cuisine: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findOpeningHours(restaurantId: string) {
    return prisma.openingHours.findMany({
      where: { restaurantId },
      select: {
        dayOfWeek: true,
        openTime: true,
        closeTime: true,
        isClosed: true,
      },
      orderBy: { dayOfWeek: "asc" },
    });
  },

  async upsertOpeningHours(
    restaurantId: string,
    hours: Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>,
  ) {
    return prisma.$transaction(
      hours.map((entry) =>
        prisma.openingHours.upsert({
          where: {
            restaurantId_dayOfWeek: {
              restaurantId,
              dayOfWeek: entry.dayOfWeek,
            },
          },
          update: {
            openTime: entry.openTime,
            closeTime: entry.closeTime,
            isClosed: entry.isClosed,
          },
          create: {
            restaurantId,
            dayOfWeek: entry.dayOfWeek,
            openTime: entry.openTime,
            closeTime: entry.closeTime,
            isClosed: entry.isClosed,
          },
        }),
      ),
    );
  },

  async countByOwnerId(ownerId: string) {
    return prisma.restaurant.count({ where: { ownerId } });
  },
};
