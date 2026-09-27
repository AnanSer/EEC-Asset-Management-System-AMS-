import { TableSkeleton } from '@/components/loading';

export default function DepartmentsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="skeleton h-7 w-52 rounded-lg" />
        <div className="skeleton h-3.5 w-72 rounded" />
      </div>
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
