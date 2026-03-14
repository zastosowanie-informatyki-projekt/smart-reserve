import { prisma } from "@/lib/prisma";
import { notificationRepository } from "../repositories/notification.repository";

export const notificationService = {
  async create(
    userId: string,
    title: string,
    message: string,
    type: string,
    link?: string,
  ) {
    return notificationRepository.create({ userId, title, message, type, link });
  },

  async notifyRestaurantStaff(
    restaurantId: string,
    title: string,
    message: string,
    type: string,
    link?: string,
  ) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        ownerId: true,
        employees: { select: { userId: true } },
      },
    });

    if (!restaurant) return;

    const userIds = [
      restaurant.ownerId,
      ...restaurant.employees.map((e) => e.userId),
    ];

    const notifications = userIds.map((userId) => ({
      userId,
      title,
      message,
      type,
      link,
    }));

    return notificationRepository.createMany(notifications);
  },

  async getForUser(userId: string) {
    return notificationRepository.findByUserId(userId);
  },

  async getUnreadCount(userId: string) {
    return notificationRepository.countUnread(userId);
  },

  async markAsRead(id: string) {
    return notificationRepository.markAsRead(id);
  },

  async markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  },

  async delete(id: string, userId: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new Error("Notification not found");
    }
    if (notification.userId !== userId) {
      throw new Error("You can only delete your own notifications");
    }
    return notificationRepository.delete(id);
  },
};
