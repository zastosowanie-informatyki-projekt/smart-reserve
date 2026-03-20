import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMyRestaurants } from "@/server/restaurants/actions/get-my-restaurants";
import { getMyEmployeeRestaurants } from "@/server/employees/actions/get-my-employee-restaurants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const isOwner = session.user.role === "RESTAURANT_OWNER";

  const [ownedResult, employeeResult] = await Promise.all([
    getMyRestaurants(),
    getMyEmployeeRestaurants(),
  ]);

  const restaurants = ownedResult.success ? ownedResult.data : [];
  const employeeList = employeeResult.success
    ? employeeResult.data.map((r) => r.restaurant)
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your restaurants</p>
        </div>
        {isOwner && (
          <Link href="/dashboard/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Restaurant
            </Button>
          </Link>
        )}
      </div>

      {restaurants.length === 0 && employeeList.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          You haven&apos;t created any restaurants yet.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {restaurants.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">My Restaurants</h2>
              <div className="grid gap-4">
                {restaurants.map((restaurant) => (
                  <RestaurantOwnerCard
                    key={restaurant.id}
                    id={restaurant.id}
                    name={restaurant.name}
                    city={restaurant.city}
                    cuisines={restaurant.cuisines}
                  />
                ))}
              </div>
            </div>
          )}

          {employeeList.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Employee At
                <Badge variant="secondary">{employeeList.length}</Badge>
              </h2>
              <div className="grid gap-4">
                {employeeList.map((restaurant) => (
                  <RestaurantOwnerCard
                    key={restaurant.id}
                    id={restaurant.id}
                    name={restaurant.name}
                    city={restaurant.city}
                    cuisines={restaurant.cuisines}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
