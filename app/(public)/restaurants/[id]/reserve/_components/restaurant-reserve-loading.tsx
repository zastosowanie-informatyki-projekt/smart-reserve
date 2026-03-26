import { Skeleton } from "@/components/ui/skeleton";

export const RestaurantReserveLoading = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
      </div>

      <div className="mb-6 space-y-2">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-3">
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
};
