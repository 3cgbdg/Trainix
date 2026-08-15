import { Skeleton } from "@/components/ui/Feedback";

export default function ProductLoading() {
  return (
    <div role="status" aria-label="Loading page" className="space-y-6">
      <Skeleton className="h-9 w-52" />
      <Skeleton className="h-52 w-full rounded-card" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-32 rounded-card" />
        <Skeleton className="h-32 rounded-card" />
        <Skeleton className="h-32 rounded-card" />
        <Skeleton className="h-32 rounded-card" />
      </div>
      <span className="sr-only">Loading Trainix</span>
    </div>
  );
}
