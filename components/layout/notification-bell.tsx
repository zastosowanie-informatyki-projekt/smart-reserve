"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getNotifications } from "@/server/notifications/actions/get-notifications";
import { getUnreadCount } from "@/server/notifications/actions/get-unread-count";
import { markNotificationRead } from "@/server/notifications/actions/mark-notification-read";
import { markAllRead } from "@/server/notifications/actions/mark-all-read";
import { Bell, CheckCheck } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: Date;
};

export const NotificationBell = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getUnreadCount().then((r) => {
      if (r.success) setUnreadCount(r.data);
    });
  }, []);

  useEffect(() => {
    if (open) {
      getNotifications().then((r) => {
        if (r.success) setNotifications(r.data);
      });
    }
  }, [open]);

  const handleClick = (notification: Notification) => {
    if (!notification.read) {
      startTransition(async () => {
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n,
          ),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      });
    }
    if (notification.link) {
      setOpen(false);
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    });
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" />
        }
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={handleMarkAllRead}
              disabled={isPending}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleClick(notification)}
                className={`flex w-full flex-col gap-0.5 border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent ${
                  !notification.read ? "bg-accent/50" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                  <span className="text-sm font-medium">
                    {notification.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {notification.message}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatTime(notification.createdAt)}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
