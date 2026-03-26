import { Skeleton } from "@/components/ui/skeleton";

export const ProfilePageLoading = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <div className="mb-4 space-y-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-44" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-52" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <div className="mb-4 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
};
