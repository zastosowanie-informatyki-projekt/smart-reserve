import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 md:py-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Find and reserve tables at the best restaurants
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Browse restaurants, check availability, and book your table in
            seconds. No phone calls needed.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/restaurants">
            <Button size="lg" className="w-full sm:w-auto">
              Browse Restaurants
            </Button>
          </Link>
          <Link href="/dashboard/new">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              List Your Restaurant
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
