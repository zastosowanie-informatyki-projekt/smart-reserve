import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { CreateRoomInput, UpdateRoomInput, FloorPlan } from "../types";

export const roomRepository = {
  async create(data: CreateRoomInput) {
    return prisma.room.create({
      data,
      select: {
        id: true,
        name: true,
        description: true,
        restaurantId: true,
        createdAt: true,
      },
    });
  },

  async update(data: UpdateRoomInput) {
    const { id, ...rest } = data;
    return prisma.room.update({
      where: { id },
      data: rest,
      select: {
        id: true,
        name: true,
        description: true,
        restaurantId: true,
        updatedAt: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.room.delete({ where: { id } });
  },

  async findById(id: string) {
    return prisma.room.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        restaurantId: true,
      },
    });
  },

  async findByRestaurantId(restaurantId: string) {
    return prisma.room.findMany({
      where: { restaurantId },
      select: {
        id: true,
        name: true,
        description: true,
        tables: {
          where: { isActive: true },
          select: {
            id: true,
            label: true,
            capacity: true,
            description: true,
            isActive: true,
          },
          orderBy: { label: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  },

  async findWithFloorPlanByRestaurantId(restaurantId: string) {
    return prisma.room.findMany({
      where: { restaurantId },
      select: {
        id: true,
        name: true,
        description: true,
        floorPlan: true,
        tables: {
          select: {
            id: true,
            label: true,
            capacity: true,
            isActive: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  },

  async saveFloorPlan(roomId: string, floorPlan: FloorPlan) {
    return prisma.room.update({
      where: { id: roomId },
      data: { floorPlan: floorPlan as unknown as Prisma.InputJsonValue },
      select: { id: true },
    });
  },
};
