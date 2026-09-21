import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { ClipboardList } from 'lucide-react';

export default function AssignmentsPage() {
  return (
    <div>
      <PageHeader title="Assignments" description="Track asset assignments to employees and departments." />
      <div className="eec-card">
        <EmptyState icon={ClipboardList} title="No Assignments Yet" description="Assignment records will show here once assets are assigned." />
      </div>
    </div>
  );
}
