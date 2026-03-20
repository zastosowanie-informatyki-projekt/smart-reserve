import type { Prisma } from "@/app/generated/prisma/client";
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

  async softDeleteAndCleanupFloorPlan(id: string) {
    return prisma.$transaction(async (tx) => {
      const table = await tx.restaurantTable.findUnique({
        where: { id },
        select: { roomId: true },
      });

      if (table) {
        const room = await tx.room.findUnique({
          where: { id: table.roomId },
          select: { floorPlan: true },
        });

        const floorPlan = room?.floorPlan;
        if (
          floorPlan &&
          typeof floorPlan === "object" &&
          !Array.isArray(floorPlan)
        ) {
          const floorPlanObject = floorPlan as Prisma.JsonObject;
          const elements = floorPlanObject["elements"];

          if (Array.isArray(elements)) {
            const nextElements = elements.filter((element) => {
              if (!element || typeof element !== "object" || Array.isArray(element)) {
                return true;
              }

              const floorPlanElement = element as Prisma.JsonObject;
              return !(
                floorPlanElement["type"] === "table" &&
                floorPlanElement["tableId"] === id
              );
            });

            await tx.room.update({
              where: { id: table.roomId },
              data: {
                floorPlan: {
                  ...floorPlanObject,
                  elements: nextElements as Prisma.JsonArray,
                } satisfies Prisma.InputJsonValue,
              },
            });
          }
        }
      }

      return tx.restaurantTable.update({
        where: { id },
        data: { isActive: false },
      });
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

  async findAvailable(
    restaurantId: string,
    startTime: Date,
    endTime: Date,
    guestCount: number,
  ) {
    return prisma.restaurantTable.findMany({
      where: {
        room: { restaurantId },
        isActive: true,
        capacity: { gte: guestCount },
        reservations: {
          none: {
            status: { notIn: ["CANCELLED", "NO_SHOW"] },
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        },
      },
      select: {
        id: true,
        label: true,
        capacity: true,
        description: true,
      },
      orderBy: { capacity: "asc" },
    });
  },
};
