import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import { getRestaurant } from "@/server/restaurants/actions/get-restaurant";
import { RestaurantOverviewCard } from "./_components/restaurant-overview-card";
import { PhotoGallery } from "./_components/photo-gallery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReserveCta } from "./_components/reserve-cta";
import { PhotoGallerySkeleton } from "./_components/photo-gallery-skeleton";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [restaurantResult, session] = await Promise.all([
    getRestaurant(id),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!restaurantResult.success) {
    notFound();
  }

  const restaurant = restaurantResult.data;

  const photoGallery =
    restaurant.photos.length > 0 ? (
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
          <CardDescription>Take a look at the space before you book.</CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoGallery photos={restaurant.photos} />
        </CardContent>
      </Card>
    ) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <RestaurantOverviewCard
          name={restaurant.name}
          description={restaurant.description}
          street={restaurant.street}
          buildingNumber={restaurant.buildingNumber}
          city={restaurant.city}
          phone={restaurant.phone}
          email={restaurant.email}
          website={restaurant.website}
          cuisines={restaurant.cuisines}
          openingHours={restaurant.openingHours}
        />

        <Suspense fallback={<PhotoGallerySkeleton />}>
          {photoGallery}
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Ready to reserve?</CardTitle>
            <CardDescription>
              {session
                ? "Choose date, time, and table in the booking flow."
                : "Sign in to book a table at this restaurant."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session ? (
              <Link
                href={`/restaurants/${id}/reserve`}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Reserve a table
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <ReserveCta restaurantId={id} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
