import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRestaurant } from "@/server/restaurants/actions/get-restaurant";
import { getTables } from "@/server/tables/actions/get-tables";
import { Separator } from "@/components/ui/separator";
import { RestaurantInfo } from "./_components/restaurant-info";
import { OpeningHoursDisplay } from "./_components/opening-hours-display";
import { ReservationForm } from "./_components/reservation-form";

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [restaurantResult, tablesResult, session] = await Promise.all([
    getRestaurant(id),
    getTables(id),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!restaurantResult.success) {
    notFound();
  }

  const restaurant = restaurantResult.data;
  const tables = tablesResult.success ? tablesResult.data : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-8">
        <RestaurantInfo
          name={restaurant.name}
          description={restaurant.description}
          address={restaurant.address}
          city={restaurant.city}
          phone={restaurant.phone}
          email={restaurant.email}
          cuisine={restaurant.cuisine}
        />

        <Separator />

        <OpeningHoursDisplay hours={restaurant.openingHours} />

        <Separator />

        <ReservationForm
          restaurantId={id}
          tables={tables}
          isAuthenticated={!!session}
        />
      </div>
    </div>
  );
}
