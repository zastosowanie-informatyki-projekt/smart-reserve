import { Skeleton } from "@/components/ui/skeleton";

export const FloorPlanLoading = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex items-center gap-4 border-b px-4 py-3">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-5 w-px" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="ml-auto h-7 w-28" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 shrink-0 border-r p-3">
          <div className="flex h-full flex-col gap-3">
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-9 w-full" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>

            <div className="mt-auto space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </div>
        <div className="flex flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  );
};
