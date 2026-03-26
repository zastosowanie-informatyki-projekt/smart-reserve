import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantDetailsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="space-y-6">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}
