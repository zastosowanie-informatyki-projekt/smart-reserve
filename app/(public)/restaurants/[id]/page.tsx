import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRestaurant } from "@/server/restaurants/actions/get-restaurant";
import { getFloorPlan } from "@/server/rooms/actions/get-floor-plan";
import { RestaurantInfo } from "./_components/restaurant-info";
import { OpeningHoursDisplay } from "./_components/opening-hours-display";
import { ReservationForm } from "./_components/reservation-form";
import { PhotoGallery } from "./_components/photo-gallery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [restaurantResult, floorPlanResult, session] = await Promise.all([
    getRestaurant(id),
    getFloorPlan(id),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!restaurantResult.success) {
    notFound();
  }

  const restaurant = restaurantResult.data;
  const floorPlan = floorPlanResult.success ? floorPlanResult.data : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <RestaurantInfo
          name={restaurant.name}
          description={restaurant.description}
          street={restaurant.street}
          buildingNumber={restaurant.buildingNumber}
          city={restaurant.city}
          phone={restaurant.phone}
          email={restaurant.email}
          website={restaurant.website}
          cuisines={restaurant.cuisines}
        />

        {restaurant.photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>Take a look at the space before you book.</CardDescription>
            </CardHeader>
            <CardContent>
            <PhotoGallery photos={restaurant.photos} />
            </CardContent>
          </Card>
        )}

        <OpeningHoursDisplay hours={restaurant.openingHours} />

        <ReservationForm
          restaurantId={id}
          isAuthenticated={!!session}
          openingHours={restaurant.openingHours}
          floorPlan={floorPlan}
        />
      </div>
    </div>
  );
}
