import { authService } from "@/server/auth/services/auth.service";
import { roomRepository } from "@/server/rooms/repositories/room.repository";
import { tableRepository } from "../repositories/table.repository";
import type { CreateTableInput, UpdateTableInput } from "../types";

export const tableService = {
  async create(data: CreateTableInput) {
    const session = await authService.requireAuth();
    const room = await roomRepository.findById(data.roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    await authService.requireRestaurantAccess(
      session.user.id,
      room.restaurantId,
    );
    return tableRepository.create(data);
  },

  async update(data: UpdateTableInput) {
    const session = await authService.requireAuth();
    const table = await tableRepository.findById(data.id);

    if (!table) {
      throw new Error("Table not found");
    }

    await authService.requireRestaurantAccess(
      session.user.id,
      table.room.restaurantId,
    );

    return tableRepository.update(data);
  },

  async delete(id: string) {
    const session = await authService.requireAuth();
    const table = await tableRepository.findById(id);

    if (!table) {
      throw new Error("Table not found");
    }

    await authService.requireRestaurantAccess(
      session.user.id,
      table.room.restaurantId,
    );

    return tableRepository.softDelete(id);
  },

  async findByRestaurantId(restaurantId: string) {
    return tableRepository.findByRestaurantId(restaurantId);
  },
};
