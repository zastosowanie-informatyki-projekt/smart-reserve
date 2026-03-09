import { prisma } from "@/lib/prisma";
import { authService } from "@/server/auth/services/auth.service";
import { restaurantRepository } from "../repositories/restaurant.repository";
import type {
  CreateRestaurantInput,
  UpdateRestaurantInput,
  SetOpeningHoursInput,
} from "../types";

export const restaurantService = {
  async create(data: CreateRestaurantInput) {
    const session = await authService.requireAuth();

    const restaurant = await restaurantRepository.create({
      ...data,
      ownerId: session.user.id,
    });

    const existingCount = await restaurantRepository.countByOwnerId(
      session.user.id,
    );
    if (existingCount === 1) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: "RESTAURANT_OWNER" },
      });
    }

    return restaurant;
  },

  async update(data: UpdateRestaurantInput) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, data.id);
    return restaurantRepository.update(data);
  },

  async delete(id: string) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, id);
    return restaurantRepository.delete(id);
  },

  async findById(id: string) {
    const restaurant = await restaurantRepository.findById(id);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }
    return restaurant;
  },

  async findMany(filters?: { city?: string; cuisine?: string }) {
    return restaurantRepository.findMany(filters);
  },

  async findOpeningHours(restaurantId: string) {
    return restaurantRepository.findOpeningHours(restaurantId);
  },

  async setOpeningHours(data: SetOpeningHoursInput) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(
      session.user.id,
      data.restaurantId,
    );
    return restaurantRepository.upsertOpeningHours(
      data.restaurantId,
      data.hours,
    );
  },
};
