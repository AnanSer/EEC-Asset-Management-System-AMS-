import { CardSkeleton, StatCardSkeleton } from '@/components/loading';

export default function NotificationsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="skeleton h-7 w-64 rounded-lg" />
        <div className="skeleton h-3.5 w-80 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="eec-card p-4">
        <div className="skeleton h-10 w-full rounded-lg" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} lines={2} />
        ))}
      </div>
    </div>
  );
}
