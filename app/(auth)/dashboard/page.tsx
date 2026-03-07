import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMyRestaurants } from "@/server/restaurants/actions/get-my-restaurants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RestaurantOwnerCard } from "./_components/restaurant-owner-card";

export const metadata = {
  title: "Dashboard | TableSpot",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const result = await getMyRestaurants();
  const restaurants = result.success ? result.data : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your restaurants</p>
        </div>
        <Link href="/dashboard/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Restaurant
          </Button>
        </Link>
      </div>
      {restaurants.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          You haven't created any restaurants yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {restaurants.map((restaurant) => (
            <RestaurantOwnerCard
              key={restaurant.id}
              id={restaurant.id}
              name={restaurant.name}
              city={restaurant.city}
              cuisine={restaurant.cuisine}
            />
          ))}
        </div>
      )}
    </div>
  );
}
