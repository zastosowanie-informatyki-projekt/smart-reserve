import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import type { Session } from "../types";

export const authService = {
  async getSession(): Promise<Session | null> {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  },

  async requireAuth(): Promise<Session> {
    const session = await this.getSession();
    if (!session) {
      throw new Error("Authentication required");
    }
    return session;
  },

  async requireRestaurantOwner(
    userId: string,
    restaurantId: string,
  ): Promise<void> {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { ownerId: true },
    });

    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    if (restaurant.ownerId !== userId) {
      throw new Error("You are not the owner of this restaurant");
    }
  },
};
