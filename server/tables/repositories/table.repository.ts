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
        roomId: true,
        room: { select: { restaurantId: true } },
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
        roomId: true,
        room: { select: { restaurantId: true } },
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
        roomId: true,
        room: { select: { restaurantId: true } },
      },
    });
  },

  async findByRoomId(roomId: string, activeOnly = true) {
    return prisma.restaurantTable.findMany({
      where: {
        roomId,
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

  async findByRestaurantId(restaurantId: string, activeOnly = true) {
    return prisma.restaurantTable.findMany({
      where: {
        room: { restaurantId },
        ...(activeOnly && { isActive: true }),
      },
      select: {
        id: true,
        label: true,
        capacity: true,
        description: true,
        isActive: true,
        roomId: true,
      },
      orderBy: { label: "asc" },
    });
  },
};
