import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSectionsSkeleton = () => {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
};
