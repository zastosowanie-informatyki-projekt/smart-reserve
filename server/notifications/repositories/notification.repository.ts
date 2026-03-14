import { prisma } from "@/lib/prisma";

export const notificationRepository = {
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    link?: string;
  }) {
    return prisma.notification.create({
      data,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        read: true,
        link: true,
        createdAt: true,
      },
    });
  },

  async createMany(
    notifications: Array<{
      userId: string;
      title: string;
      message: string;
      type: string;
      link?: string;
    }>,
  ) {
    return prisma.notification.createMany({ data: notifications });
  },

  async findByUserId(userId: string, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        read: true,
        link: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async countUnread(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  },

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  async findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
  },

  async delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  },
};
