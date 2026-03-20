import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CalendarDays, LayoutDashboard, Menu, Store, Mail } from "lucide-react";
import { getMyRestaurants } from "@/server/restaurants/actions/get-my-restaurants";
import { getMyEmployeeRestaurants } from "@/server/employees/actions/get-my-employee-restaurants";
import { NavbarAuth } from "./navbar-auth";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { DesktopSidebar } from "./desktop-sidebar";

type SidebarIconKey = "store" | "calendar" | "mail" | "dashboard";

interface NavItem {
  href: string;
  label: string;
  icon: SidebarIconKey;
}

const navLinkClassName =
  "inline-flex h-7 items-center justify-start gap-1 rounded-[min(var(--radius-md),12px)] border border-transparent px-2.5 text-[0.8rem] font-medium whitespace-nowrap text-muted-foreground transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const iconByKey = {
  store: Store,
  calendar: CalendarDays,
  mail: Mail,
  dashboard: LayoutDashboard,
};

const SidebarLinks = ({ items }: { items: NavItem[] }) => {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = iconByKey[item.icon];

        return (
          <Link key={item.href} href={item.href} className={navLinkClassName}>
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export const SidebarNav = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let hasRestaurants = false;
  if (session) {
    const [ownedResult, employeeResult] = await Promise.all([getMyRestaurants(), getMyEmployeeRestaurants()]);
    const owned = ownedResult.success ? ownedResult.data : [];
    const employee = employeeResult.success ? employeeResult.data : [];
    hasRestaurants = owned.length > 0 || employee.length > 0;
  }

  const navItems: NavItem[] = [{ href: "/restaurants", label: "Browse Restaurants", icon: "store" }];

  if (session) {
    navItems.push({ href: "/reservations", label: "My Reservations", icon: "calendar" });
    navItems.push({ href: "/invitations", label: "Invitations", icon: "mail" });
    if (hasRestaurants) {
      navItems.push({ href: "/dashboard", label: "My Restaurants", icon: "dashboard" });
    }
  }

  return (
    <>
      <DesktopSidebar items={navItems} session={session} />

      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Browse pages and manage your account.</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-6 px-4 py-4">
              <SidebarLinks items={navItems} />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="text-lg font-semibold tracking-tight">
          TableSpot
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session && <NotificationBell />}
          <NavbarAuth session={session} />
        </div>
      </div>
    </>
  );
};
