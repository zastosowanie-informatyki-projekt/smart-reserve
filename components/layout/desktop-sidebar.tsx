"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen, Store, CalendarDays, Mail, LayoutDashboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavbarAuth } from "./navbar-auth";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";

type SidebarIconKey = "store" | "calendar" | "mail" | "dashboard";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "tablespot-sidebar-collapsed";

interface NavItem {
  href: string;
  label: string;
  icon: SidebarIconKey;
}

const iconByKey: Record<SidebarIconKey, LucideIcon> = {
  store: Store,
  calendar: CalendarDays,
  mail: Mail,
  dashboard: LayoutDashboard,
};

const navLinkClassName =
  "inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-transparent text-[0.8rem] font-medium whitespace-nowrap text-muted-foreground transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export const DesktopSidebar = ({
  items,
  session,
}: {
  items: NavItem[];
  session: {
    user: { name: string; email: string; image?: string | null };
  } | null;
}) => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    if (stored === "true") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? "true" : "false");
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "hidden shrink-0 self-start border-r bg-sidebar/70 py-5 transition-[width,padding] duration-200 md:sticky md:top-0 md:flex md:h-screen",
        collapsed ? "w-22 px-1.5" : "w-56 px-3",
      )}
    >
      <div className="flex h-full w-full flex-col justify-between">
        <div className="space-y-6">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
            <Link
              href="/"
              className={cn(
                "font-semibold tracking-tight text-foreground",
                collapsed ? "text-base" : "text-xl",
              )}
            >
              {collapsed ? "TS" : "TableSpot"}
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed((previous) => !previous)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = iconByKey[item.icon];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(navLinkClassName, collapsed ? "justify-center px-0" : "justify-start px-2.5")}
                >
                  <Icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
            {!collapsed && (
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Appearance
              </span>
            )}
            <ThemeToggle />
          </div>
          <div className={cn("flex items-center gap-2", collapsed ? "justify-center" : "justify-end")}>
            {session && <NotificationBell />}
            <NavbarAuth session={session} />
          </div>
        </div>
      </div>
    </aside>
  );
};
