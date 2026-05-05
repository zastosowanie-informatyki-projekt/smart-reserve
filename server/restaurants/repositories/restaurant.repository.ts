import { CuisineType } from "@/app/generated/prisma/client";
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
        street: true,
        buildingNumber: true,
        city: true,
        phone: true,
        email: true,
        imageUrl: true,
        website: true,
        cuisines: true,
        hasDisabledFacilities: true,
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
        street: true,
        buildingNumber: true,
        city: true,
        phone: true,
        email: true,
        imageUrl: true,
        website: true,
        cuisines: true,
        hasDisabledFacilities: true,
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
        street: true,
        buildingNumber: true,
        city: true,
        phone: true,
        email: true,
        imageUrl: true,
        website: true,
        cuisines: true,
        hasDisabledFacilities: true,
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
        photos: {
          select: {
            id: true,
            url: true,
            altText: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });
  },

  async findMany(filters?: { city?: string; cuisine?: CuisineType }) {
    return prisma.restaurant.findMany({
      where: {
        ...(filters?.city && { city: { contains: filters.city, mode: "insensitive" as const } }),
        ...(filters?.cuisine && { cuisines: { has: filters.cuisine } }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        street: true,
        buildingNumber: true,
        city: true,
        cuisines: true,
        imageUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /** Assistant chat: optional city substring and/or any-of cuisine tags (OR within tags). */
  async findManyForChat(filters: { cityContains?: string; cuisineTags?: CuisineType[] }) {
    const { cityContains, cuisineTags } = filters;
    const hasTags = cuisineTags != null && cuisineTags.length > 0;
    return prisma.restaurant.findMany({
      where: {
        ...(cityContains && {
          city: { contains: cityContains, mode: "insensitive" as const },
        }),
        ...(hasTags && {
          cuisines: { hasSome: cuisineTags },
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        street: true,
        buildingNumber: true,
        city: true,
        cuisines: true,
        imageUrl: true,
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
  },

  async findDistinctCities(): Promise<string[]> {
    const rows = await prisma.restaurant.findMany({
      distinct: ["city"],
      select: { city: true },
      orderBy: { city: "asc" },
    });
    return rows.map((r) => r.city);
  },

  async findByOwnerId(ownerId: string) {
    return prisma.restaurant.findMany({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        city: true,
        cuisines: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async countByOwnerId(ownerId: string) {
    return prisma.restaurant.count({
      where: { ownerId },
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
};
