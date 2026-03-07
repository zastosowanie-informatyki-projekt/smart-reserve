import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRestaurant } from "@/server/restaurants/actions/get-restaurant";
import { getTables } from "@/server/tables/actions/get-tables";
import { getRestaurantReservations } from "@/server/reservations/actions/get-restaurant-reservations";
import { Separator } from "@/components/ui/separator";
import { EditRestaurantForm } from "./_components/edit-restaurant-form";
import { TableManagement } from "./_components/table-management";
import { OpeningHoursForm } from "./_components/opening-hours-form";
import { ReservationManagement } from "./_components/reservation-management";

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

  const [restaurantResult, tablesResult, reservationsResult] =
    await Promise.all([
      getRestaurant(id),
      getTables(id),
      getRestaurantReservations(id),
    ]);

  if (!restaurantResult.success) {
    notFound();
  }

  const restaurant = restaurantResult.data;

  if (restaurant.ownerId !== session.user.id) {
    redirect("/dashboard");
  }

  const tables = tablesResult.success ? tablesResult.data : [];
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
          Edit details, manage tables, set opening hours, and view reservations
        </p>
      </div>
      <div className="flex flex-col gap-8">
        <EditRestaurantForm restaurant={restaurant} />
        <Separator />
        <TableManagement restaurantId={id} tables={tables} />
        <Separator />
        <OpeningHoursForm
          restaurantId={id}
          currentHours={restaurant.openingHours}
        />
        <Separator />
        <ReservationManagement reservations={reservations} />
      </div>
    </div>
  );
}
