"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, CalendarDays } from "lucide-react";

export const NavbarAuth = ({
  session,
}: {
  session: {
    user: { name: string; email: string; image?: string | null; role?: string };
  } | null;
}) => {
  const handleSignIn = async () => {
    await authClient.signIn.social({ provider: "google" });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  if (!session) {
    return (
      <Button variant="default" size="sm" onClick={handleSignIn}>
        Sign In
      </Button>
    );
  }

  const isOwner = session.user.role === "RESTAURANT_OWNER";

  return (
    <div className="flex items-center gap-3">
      <Link href="/reservations">
        <Button variant="ghost" size="sm" className="hidden md:flex">
          <CalendarDays className="mr-1.5 h-4 w-4" />
          My Reservations
        </Button>
      </Link>
      {isOwner && (
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <LayoutDashboard className="mr-1.5 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-full" />
          }
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {session.user.email}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="md:hidden" render={<Link href="/reservations" />}>
            <CalendarDays className="mr-2 h-4 w-4" />
            My Reservations
          </DropdownMenuItem>
          {isOwner && (
            <DropdownMenuItem className="md:hidden" render={<Link href="/dashboard" />}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
