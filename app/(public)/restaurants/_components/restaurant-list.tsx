import { CuisineType } from "@/app/generated/prisma/client";
import { RestaurantCard } from "./restaurant-card";

export const RestaurantList = ({
  restaurants,
}: {
  restaurants: Array<{
    id: string;
    name: string;
    description: string | null;
    city: string;
    cuisines: CuisineType[];
  }>;
}) => {
  if (restaurants.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No restaurants found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} {...restaurant} />
      ))}
    </div>
  );
};
