import { Skeleton } from "@/components/ui/skeleton";

export const AuthLoading = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
};
