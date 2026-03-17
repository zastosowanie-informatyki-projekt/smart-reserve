import { CuisineType } from "@/app/generated/prisma/client";
import { authService } from "@/server/auth/services/auth.service";
import { restaurantRepository } from "../repositories/restaurant.repository";
import type {
  CreateRestaurantInput,
  UpdateRestaurantInput,
  SetOpeningHoursInput,
} from "../types";

export const restaurantService = {
  async create(data: CreateRestaurantInput) {
    const session = await authService.requireRole("RESTAURANT_OWNER");
    return restaurantRepository.create({ ...data, ownerId: session.user.id });
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

  async findMany(filters?: { city?: string; cuisine?: CuisineType }) {
    return restaurantRepository.findMany(filters);
  },

  async findOpeningHours(restaurantId: string) {
    return restaurantRepository.findOpeningHours(restaurantId);
  },

  async setOpeningHours(data: SetOpeningHoursInput) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantAccess(
      session.user.id,
      data.restaurantId,
    );
    return restaurantRepository.upsertOpeningHours(
      data.restaurantId,
      data.hours,
    );
  },
};
