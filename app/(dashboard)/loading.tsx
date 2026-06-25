import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-10 w-48 rounded-xl bg-[#E8952E]/10" />
      <Skeleton className="h-32 w-full rounded-[20px] bg-[#E8952E]/8" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-[20px] bg-[#E8952E]/8" />
        ))}
      </div>
    </div>
  );
}
