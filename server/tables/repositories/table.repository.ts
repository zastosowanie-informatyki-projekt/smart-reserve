import { prisma } from "@/lib/prisma";
import type { CreateTableInput, UpdateTableInput } from "../types";

export const tableRepository = {
  async create(data: CreateTableInput) {
    return prisma.restaurantTable.create({
      data,
      select: {
        id: true,
        label: true,
        capacity: true,
        description: true,
        isActive: true,
        restaurantId: true,
        createdAt: true,
      },
    });
  },

  async update(data: UpdateTableInput) {
    const { id, ...rest } = data;
    return prisma.restaurantTable.update({
      where: { id },
      data: rest,
      select: {
        id: true,
        label: true,
        capacity: true,
        description: true,
        isActive: true,
        restaurantId: true,
        updatedAt: true,
      },
    });
  },

  async softDelete(id: string) {
    return prisma.restaurantTable.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async findById(id: string) {
    return prisma.restaurantTable.findUnique({
      where: { id },
      select: {
        id: true,
        label: true,
        capacity: true,
        description: true,
        isActive: true,
        restaurantId: true,
      },
    });
  },

  async findByRestaurantId(restaurantId: string, activeOnly = true) {
    return prisma.restaurantTable.findMany({
      where: {
        restaurantId,
        ...(activeOnly && { isActive: true }),
      },
      select: {
        id: true,
        label: true,
        capacity: true,
        description: true,
        isActive: true,
      },
      orderBy: { label: "asc" },
    });
  },
};
