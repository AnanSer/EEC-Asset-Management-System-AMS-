import { FormSkeleton } from '@/components/loading';

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="skeleton h-7 w-48 rounded-lg" />
        <div className="skeleton h-3.5 w-72 rounded" />
      </div>

      <FormSkeleton fields={6} />
    </div>
  );
}
