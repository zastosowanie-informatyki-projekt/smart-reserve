import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NavbarAuth } from "./navbar-auth";
import { NotificationBell } from "./notification-bell";

export const Navbar = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
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
            {session && (
              <Link
                href="/invitations"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Invitations
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {session && <NotificationBell />}
          <NavbarAuth session={session} />
        </div>
      </div>
    </header>
  );
};
