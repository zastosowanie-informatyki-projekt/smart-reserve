import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getRestaurant } from "@/server/restaurants/actions/get-restaurant";
import { getRestaurantReservations } from "@/server/reservations/actions/get-restaurant-reservations";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2 } from "lucide-react";
import { ReservationManagement } from "../_components/reservation-management";

const linkButtonClassName =
  "inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-transparent px-2.5 text-[0.8rem] font-medium whitespace-nowrap text-muted-foreground transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const outlineLinkButtonClassName =
  "inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium whitespace-nowrap text-foreground transition-all outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default async function ManageRestaurantReservationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const { id } = await params;

  const isOwner = await prisma.restaurant.findFirst({
    where: { id, ownerId: session.user.id },
    select: { id: true },
  });

  const isEmployee = !isOwner
    ? await prisma.restaurantEmployee.findFirst({
        where: { restaurantId: id, userId: session.user.id },
        select: { id: true },
      })
    : null;

  if (!isOwner && !isEmployee) {
    redirect("/dashboard");
  }

  const [restaurantResult, reservationsResult] = await Promise.all([
    getRestaurant(id),
    getRestaurantReservations(id),
  ]);

  if (!restaurantResult.success) {
    notFound();
  }

  const restaurant = restaurantResult.data;
  const reservations = reservationsResult.success ? reservationsResult.data : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/dashboard/${id}`} className={linkButtonClassName}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Details
        </Link>
      </div>

      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">Manage bookings for {restaurant.name}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle>{reservations.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle>
              {reservations.filter((reservation) => reservation.status === "PENDING").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confirmed</CardDescription>
            <CardTitle>
              {reservations.filter((reservation) => reservation.status === "CONFIRMED").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <ReservationManagement reservations={reservations} />
    </div>
  );
}
