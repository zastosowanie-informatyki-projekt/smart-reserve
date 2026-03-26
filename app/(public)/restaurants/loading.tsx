import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="mb-8">
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
