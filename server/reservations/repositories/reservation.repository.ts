import { prisma } from "@/lib/prisma";
import type { ReservationStatus } from "@/app/generated/prisma/client";
import type { CreateReservationInput, UpdateReservationInput } from "../types";

export const reservationRepository = {
  async create(data: CreateReservationInput & { userId: string }) {
    return prisma.reservation.create({
      data,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        guestCount: true,
        status: true,
        notes: true,
        tableId: true,
        restaurantId: true,
        userId: true,
        createdAt: true,
      },
    });
  },

  async findById(id: string) {
    return prisma.reservation.findUnique({
      where: { id },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        guestCount: true,
        status: true,
        notes: true,
        userId: true,
        tableId: true,
        restaurantId: true,
        createdAt: true,
        table: {
          select: { label: true, capacity: true },
        },
        restaurant: {
          select: { name: true },
        },
      },
    });
  },

  async findByUserId(userId: string) {
    return prisma.reservation.findMany({
      where: { userId },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        guestCount: true,
        status: true,
        notes: true,
        createdAt: true,
        table: {
          select: { label: true },
        },
        restaurant: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startTime: "desc" },
    });
  },

  async findByRestaurantId(
    restaurantId: string,
    filters?: { from?: Date; to?: Date },
  ) {
    return prisma.reservation.findMany({
      where: {
        restaurantId,
        ...(filters?.from && { startTime: { gte: filters.from } }),
        ...(filters?.to && { endTime: { lte: filters.to } }),
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        guestCount: true,
        status: true,
        notes: true,
        createdAt: true,
        table: {
          select: { id: true, label: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { startTime: "asc" },
    });
  },

  async update(data: UpdateReservationInput) {
    const { id, ...rest } = data;
    return prisma.reservation.update({
      where: { id },
      data: rest,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        guestCount: true,
        status: true,
        notes: true,
        tableId: true,
        restaurantId: true,
        userId: true,
        createdAt: true,
      },
    });
  },

  async updateStatus(id: string, status: ReservationStatus) {
    return prisma.reservation.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
      },
    });
  },

  async completeExpired() {
    return prisma.reservation.updateMany({
      where: {
        status: "CONFIRMED",
        endTime: { lt: new Date() },
      },
      data: { status: "COMPLETED" },
    });
  },

  async findOverlapping(
    tableId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ) {
    return prisma.reservation.findFirst({
      where: {
        tableId,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });
  },
};
