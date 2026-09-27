import { ChartSkeleton, StatCardSkeleton } from '@/components/loading';

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="skeleton h-7 w-60 rounded-lg" />
        <div className="skeleton h-3.5 w-80 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height={280} />
        <ChartSkeleton height={280} />
      </div>
    </div>
  );
}
