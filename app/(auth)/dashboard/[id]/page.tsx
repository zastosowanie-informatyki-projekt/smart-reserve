import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getRestaurant } from "@/server/restaurants/actions/get-restaurant";
import { getRooms } from "@/server/rooms/actions/get-rooms";
import { getRestaurantReservations } from "@/server/reservations/actions/get-restaurant-reservations";
import { Separator } from "@/components/ui/separator";
import { EditRestaurantForm } from "./_components/edit-restaurant-form";
import { RoomManagement } from "./_components/room-management";
import { OpeningHoursForm } from "./_components/opening-hours-form";
import { ReservationManagement } from "./_components/reservation-management";
import { PhotoManagement } from "./_components/photo-management";
import { EmployeeManagement } from "./_components/employee-management";

export default async function ManageRestaurantPage({
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

  const [restaurantResult, roomsResult, reservationsResult] =
    await Promise.all([
      getRestaurant(id),
      getRooms(id),
      getRestaurantReservations(id),
    ]);

  if (!restaurantResult.success) {
    notFound();
  }

  const restaurant = restaurantResult.data;
  const rooms = roomsResult.success ? roomsResult.data : [];
  const reservations = reservationsResult.success
    ? reservationsResult.data
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Manage {restaurant.name}
        </h1>
        <p className="text-muted-foreground">
          Edit details, manage rooms & tables, set opening hours, and view
          reservations
        </p>
      </div>
      <div className="flex flex-col gap-8">
        <EditRestaurantForm restaurant={restaurant} />
        <Separator />
        <PhotoManagement
          restaurantId={id}
          photos={restaurant.photos}
        />
        <Separator />
        <RoomManagement restaurantId={id} rooms={rooms} />
        <Separator />
        <OpeningHoursForm
          restaurantId={id}
          currentHours={restaurant.openingHours}
        />
        <Separator />
        <ReservationManagement reservations={reservations} />
        {!!isOwner && (
          <>
            <Separator />
            <EmployeeManagement restaurantId={id} />
          </>
        )}
      </div>
    </div>
  );
}
