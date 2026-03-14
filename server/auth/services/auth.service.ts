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

  async requireRole(role: "USER" | "RESTAURANT_OWNER" | "EMPLOYEE"): Promise<Session> {
    const session = await this.requireAuth();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!user || user.role !== role) {
      throw new Error(`Only users with the ${role} role can perform this action`);
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

  async requireRestaurantAccess(
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

    if (restaurant.ownerId === userId) {
      return;
    }

    const employee = await prisma.restaurantEmployee.findUnique({
      where: { userId_restaurantId: { userId, restaurantId } },
    });

    if (!employee) {
      throw new Error("You do not have access to this restaurant");
    }
  },
};
