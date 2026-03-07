import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NavbarAuth } from "./navbar-auth";

export const Navbar = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let hasRestaurants = false;
  if (session) {
    const count = await prisma.restaurant.count({
      where: { ownerId: session.user.id },
    });
    hasRestaurants = count > 0;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            TableSpot
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link
              href="/restaurants"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Browse Restaurants
            </Link>
          </nav>
        </div>
        <NavbarAuth session={session} hasRestaurants={hasRestaurants} />
      </div>
    </header>
  );
};
