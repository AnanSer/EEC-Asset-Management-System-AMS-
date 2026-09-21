import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
}

function Bone({ className }: SkeletonProps) {
  return <div className={clsx('skeleton rounded-lg', className)} />;
}

export function StatCardSkeleton() {
  return (
    <div className="eec-card border-l-4 border-l-slate-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Bone className="h-3 w-28" />
          <Bone className="h-8 w-20" />
          <Bone className="h-3 w-24" />
        </div>
        <Bone className="w-12 h-12 rounded-xl" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Bone className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="eec-card space-y-3">
      <Bone className="h-4 w-3/4" />
      <Bone className="h-3 w-full" />
      <Bone className="h-3 w-5/6" />
      <Bone className="h-3 w-2/3" />
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    </div>
  );
}
