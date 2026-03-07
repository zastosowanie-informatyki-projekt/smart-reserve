import { authService } from "@/server/auth/services/auth.service";
import { tableRepository } from "../repositories/table.repository";
import type { CreateTableInput, UpdateTableInput } from "../types";

export const tableService = {
  async create(data: CreateTableInput) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(
      session.user.id,
      data.restaurantId,
    );
    return tableRepository.create(data);
  },

  async update(data: UpdateTableInput) {
    const session = await authService.requireAuth();
    const table = await tableRepository.findById(data.id);

    if (!table) {
      throw new Error("Table not found");
    }

    await authService.requireRestaurantOwner(
      session.user.id,
      table.restaurantId,
    );

    return tableRepository.update(data);
  },

  async delete(id: string) {
    const session = await authService.requireAuth();
    const table = await tableRepository.findById(id);

    if (!table) {
      throw new Error("Table not found");
    }

    await authService.requireRestaurantOwner(
      session.user.id,
      table.restaurantId,
    );

    return tableRepository.softDelete(id);
  },

  async findByRestaurantId(restaurantId: string) {
    return tableRepository.findByRestaurantId(restaurantId);
  },
};
