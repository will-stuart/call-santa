import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Title skeleton */}
      <div className="text-center mb-12">
        <Skeleton className="h-16 w-72 mx-auto mb-4" />
        <Skeleton className="h-6 w-48 mx-auto" />
      </div>

      {/* Call button skeleton */}
      <div className="mb-8">
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>

      {/* Status skeleton */}
      <Skeleton className="h-6 w-32" />
    </div>
  );
};
