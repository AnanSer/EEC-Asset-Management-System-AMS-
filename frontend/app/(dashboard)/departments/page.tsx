import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { Building2 } from 'lucide-react';

export default function DepartmentsPage() {
  return (
    <div>
      <PageHeader
        title="Departments"
        description="Manage organizational departments and their asset allocations."
      />
      <div className="eec-card">
        <EmptyState
          icon={Building2}
          title="No Departments Yet"
          description="Departments will appear here once they are added to the system."
        />
      </div>
    </div>
  );
}
