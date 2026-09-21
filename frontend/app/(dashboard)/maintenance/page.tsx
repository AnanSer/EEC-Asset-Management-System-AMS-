import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div>
      <PageHeader title="Maintenance" description="Schedule and track asset maintenance activities." />
      <div className="eec-card">
        <EmptyState icon={Wrench} title="No Maintenance Records" description="Maintenance requests and schedules will appear here." />
      </div>
    </div>
  );
}
