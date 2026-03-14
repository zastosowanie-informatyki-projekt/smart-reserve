import { authService } from "@/server/auth/services/auth.service";
import { roomRepository } from "../repositories/room.repository";
import type { CreateRoomInput, UpdateRoomInput } from "../types";

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
};
