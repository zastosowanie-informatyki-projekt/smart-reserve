import { Suspense } from "react";
import { getRestaurants } from "@/server/restaurants/actions/get-restaurants";
import { RestaurantFilters } from "./_components/restaurant-filters";
import { RestaurantList } from "./_components/restaurant-list";
import { RestaurantListLoading } from "./_components/restaurant-list-loading";

export const metadata = {
  title: "Browse Restaurants | TableSpot",
};

const RestaurantResults = async ({ city, cuisine }: { city?: string; cuisine?: string }) => {
  const result = await getRestaurants({ city, cuisine });
  const restaurants = result.success ? result.data : [];

  return <RestaurantList restaurants={restaurants} />;
};

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; cuisine?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Restaurants</h1>
        <p className="text-muted-foreground">
          Find the perfect spot for your next meal
        </p>
      </div>
      <div className="mb-8">
        <Suspense>
          <RestaurantFilters />
        </Suspense>
      </div>
      <Suspense fallback={<RestaurantListLoading />}>
        <RestaurantResults city={params.city} cuisine={params.cuisine} />
      </Suspense>
    </div>
  );
}
