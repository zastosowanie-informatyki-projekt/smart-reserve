import { authService } from "@/server/auth/services/auth.service";
import { roomRepository } from "../repositories/room.repository";
import type {
  CreateRoomInput,
  UpdateRoomInput,
  SaveFloorPlanInput,
  FloorPlan,
  FloorPlanTableElementWithMeta,
  EnrichedFloorPlanElement,
  RoomWithFloorPlan,
} from "../types";

export const roomService = {
  async create(data: CreateRoomInput) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantAccess(
      session.user.id,
      data.restaurantId,
    );
    return roomRepository.create(data);
  },

  async update(data: UpdateRoomInput) {
    const session = await authService.requireAuth();
    const room = await roomRepository.findById(data.id);

    if (!room) {
      throw new Error("Room not found");
    }

    await authService.requireRestaurantAccess(
      session.user.id,
      room.restaurantId,
    );

    return roomRepository.update(data);
  },

  async delete(id: string) {
    const session = await authService.requireAuth();
    const room = await roomRepository.findById(id);

    if (!room) {
      throw new Error("Room not found");
    }

    await authService.requireRestaurantAccess(
      session.user.id,
      room.restaurantId,
    );

    return roomRepository.delete(id);
  },

  async findByRestaurantId(restaurantId: string) {
    await authService.requireAuth();
    return roomRepository.findByRestaurantId(restaurantId);
  },

  async saveFloorPlan(data: SaveFloorPlanInput) {
    const session = await authService.requireAuth();
    const room = await roomRepository.findById(data.roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    await authService.requireRestaurantAccess(
      session.user.id,
      room.restaurantId,
    );

    const tableIds = data.floorPlan.elements
      .filter((el) => el.type === "table")
      .map((el) => el.tableId);

    if (tableIds.length > 0) {
      const validTables = await roomRepository.findWithFloorPlanByRestaurantId(
        room.restaurantId,
      );
      const validTableIds = new Set(
        validTables.flatMap((r) => r.tables.map((t) => t.id)),
      );
      const invalid = tableIds.find((id) => !validTableIds.has(id));
      if (invalid) {
        throw new Error(
          `Table ${invalid} does not belong to this restaurant`,
        );
      }
    }

    return roomRepository.saveFloorPlan(data.roomId, data.floorPlan);
  },

  async getFloorPlan(restaurantId: string): Promise<RoomWithFloorPlan[]> {
    const rooms = await roomRepository.findWithFloorPlanByRestaurantId(restaurantId);

    return rooms.map((room) => {
      if (!room.floorPlan) {
        return {
          id: room.id,
          name: room.name,
          description: room.description,
          floorPlan: null,
        };
      }

      const tableMap = new Map(room.tables.map((t) => [t.id, t]));
      const storedPlan = room.floorPlan as unknown as FloorPlan;

      const enrichedElements: EnrichedFloorPlanElement[] =
        storedPlan.elements.map((element) => {
          if (element.type === "table") {
            const table = tableMap.get(element.tableId) ?? null;
            return {
              ...element,
              table: table
                ? {
                    label: table.label,
                    capacity: table.capacity,
                    isActive: table.isActive,
                  }
                : null,
            } satisfies FloorPlanTableElementWithMeta;
          }
          return element;
        });

      return {
        id: room.id,
        name: room.name,
        description: room.description,
        floorPlan: {
          width: storedPlan.width,
          height: storedPlan.height,
          elements: enrichedElements,
        },
      };
    });
  },
};
