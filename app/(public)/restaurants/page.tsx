import { Suspense } from "react";
import { getRestaurants } from "@/server/restaurants/actions/get-restaurants";
import { RestaurantFilters } from "./_components/restaurant-filters";
import { RestaurantList } from "./_components/restaurant-list";

export const metadata = {
  title: "Browse Restaurants | TableSpot",
};

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; cuisine?: string }>;
}) {
  const params = await searchParams;
  const result = await getRestaurants({
    city: params.city,
    cuisine: params.cuisine,
  });

  const restaurants = result.success ? result.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
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
      <RestaurantList restaurants={restaurants} />
    </div>
  );
}
