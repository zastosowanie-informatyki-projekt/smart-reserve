import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant } from "@/server/restaurants/actions/get-restaurant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditRestaurantForm } from "./_components/edit-restaurant-form";
import { CUISINE_LABEL } from "@/lib/cuisines";
import { OpeningHoursForm } from "./_components/opening-hours-form";
import { PhotoManagement } from "./_components/photo-management";
import { EmployeeManagement } from "./_components/employee-management";
import { LayoutDashboard, ArrowUpRight, CalendarDays } from "lucide-react";
import { getDashboardAccess } from "./_lib/get-dashboard-access";

export default async function ManageRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await getDashboardAccess(id);
  const owner = access.isOwner;

  const restaurantResult = await getRestaurant(id);

  if (!restaurantResult.success) {
    notFound();
  }

  const restaurant = restaurantResult.data;
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-end justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Manage {restaurant.name}</h1>
        <p className="text-sm text-muted-foreground">
          {owner ? "Owner workspace" : "Employee workspace"}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {owner ? (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-8">
              <EditRestaurantForm restaurant={restaurant} />
              <PhotoManagement restaurantId={id} photos={restaurant.photos} />
            </div>

            <div className="flex flex-col gap-6 lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Floor Plan</CardTitle>
                  <CardDescription>
                    Manage rooms, place tables, and design your layout.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/dashboard/${id}/floor-plan`}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Open Floor Plan Editor
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reservations</CardTitle>
                  <CardDescription>
                    Review and manage reservation statuses in a dedicated view.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/dashboard/${id}/reservations`}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Open Reservations
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>

              <OpeningHoursForm restaurantId={id} currentHours={restaurant.openingHours} />
              <EmployeeManagement restaurantId={id} />
            </div>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Details</CardTitle>
                <CardDescription>You are an employee of this restaurant</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-sm">
                <p><span className="font-medium">Name:</span> {restaurant.name}</p>
                {restaurant.cuisines.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium">Cuisines:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {restaurant.cuisines.map((cuisine) => (
                        <Badge key={cuisine} variant="secondary">
                          {CUISINE_LABEL[cuisine]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <p><span className="font-medium">Address:</span> {restaurant.street} {restaurant.buildingNumber}, {restaurant.city}</p>
                {restaurant.phone && <p><span className="font-medium">Phone:</span> {restaurant.phone}</p>}
                {restaurant.email && <p><span className="font-medium">Email:</span> {restaurant.email}</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rooms &amp; Tables</CardTitle>
                <CardDescription>Open floor plan and manage reservations.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/dashboard/${id}/floor-plan`}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Open Floor Plan Editor
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Reservations</CardTitle>
                <CardDescription>View and manage reservation statuses.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/dashboard/${id}/reservations`}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Open Reservations
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
