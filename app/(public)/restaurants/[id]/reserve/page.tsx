import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import { getRestaurant } from "@/server/restaurants/actions/get-restaurant";
import { getFloorPlan } from "@/server/rooms/actions/get-floor-plan";
import { ArrowLeft } from "lucide-react";
import { ReservationForm } from "../_components/reservation-form";
import { ReservationFormLoading } from "../_components/reservation-form-loading";

export default async function RestaurantReservePage({
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

  if (!session) {
    redirect(`/restaurants/${id}`);
  }

  const restaurant = restaurantResult.data;
  const floorPlan = floorPlanResult.success ? floorPlanResult.data : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/restaurants/${id}`}
          className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-transparent px-2.5 text-[0.8rem] font-medium whitespace-nowrap text-muted-foreground transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to restaurant
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Reserve at {restaurant.name}</h1>
        <p className="text-muted-foreground">Find available tables and complete your booking.</p>
      </div>

      <Suspense fallback={<ReservationFormLoading />}>
        <ReservationForm
          restaurantId={id}
          isAuthenticated={true}
          openingHours={restaurant.openingHours}
          floorPlan={floorPlan}
        />
      </Suspense>
    </div>
  );
}
