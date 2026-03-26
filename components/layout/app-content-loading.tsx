import { Skeleton } from "@/components/ui/skeleton";

export const AppContentLoading = () => {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
};
