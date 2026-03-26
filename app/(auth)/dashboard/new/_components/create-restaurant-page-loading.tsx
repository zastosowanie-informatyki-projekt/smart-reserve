import { Skeleton } from "@/components/ui/skeleton";

export const CreateRestaurantPageLoading = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-lg border p-6">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>
    </div>
  );
};
