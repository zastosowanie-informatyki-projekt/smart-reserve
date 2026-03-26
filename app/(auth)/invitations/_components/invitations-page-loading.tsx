import { Skeleton } from "@/components/ui/skeleton";

export const InvitationsPageLoading = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
};
