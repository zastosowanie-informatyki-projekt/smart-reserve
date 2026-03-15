import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getRestaurant } from "@/server/restaurants/actions/get-restaurant";
import { getRestaurantReservations } from "@/server/reservations/actions/get-restaurant-reservations";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditRestaurantForm } from "./_components/edit-restaurant-form";
import { OpeningHoursForm } from "./_components/opening-hours-form";
import { ReservationManagement } from "./_components/reservation-management";
import { PhotoManagement } from "./_components/photo-management";
import { EmployeeManagement } from "./_components/employee-management";
import { LayoutDashboard } from "lucide-react";

export default async function ManageRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
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

  const owner = !!isOwner;

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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Manage {restaurant.name}</h1>
        <p className="text-muted-foreground">
          {owner
            ? "Edit details, set opening hours, manage your floor plan, and view reservations"
            : "View floor plan and manage reservations"}
        </p>
      </div>
      <div className="flex flex-col gap-8">
        {owner ? (
          <>
            <EditRestaurantForm restaurant={restaurant} />
            <Separator />
            <PhotoManagement restaurantId={id} photos={restaurant.photos} />
            <Separator />
            <OpeningHoursForm restaurantId={id} currentHours={restaurant.openingHours} />
            <Separator />
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
              <CardDescription>You are an employee of this restaurant</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              <p><span className="font-medium">Name:</span> {restaurant.name}</p>
              {restaurant.cuisine && <p><span className="font-medium">Cuisine:</span> {restaurant.cuisine}</p>}
              <p><span className="font-medium">Address:</span> {restaurant.address}, {restaurant.city}</p>
              {restaurant.phone && <p><span className="font-medium">Phone:</span> {restaurant.phone}</p>}
              {restaurant.email && <p><span className="font-medium">Email:</span> {restaurant.email}</p>}
            </CardContent>
          </Card>
        )}

        {!owner && <Separator />}

        {/* Floor Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Rooms &amp; Tables</CardTitle>
            <CardDescription>Manage rooms, place tables, and design your floor plan layout.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/${id}/floor-plan`}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Open Floor Plan Editor
            </Link>
          </CardContent>
        </Card>

        <Separator />
        <ReservationManagement reservations={reservations} />
        {owner && (
          <>
            <Separator />
            <EmployeeManagement restaurantId={id} />
          </>
        )}
      </div>
    </div>
  );
}
