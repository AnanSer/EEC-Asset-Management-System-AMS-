import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function EmployeesPage() {
  return (
    <div>
      <PageHeader title="Employees" description="View and manage all EEC employees and their assigned assets." />
      <div className="eec-card">
        <EmptyState icon={Users} title="No Employees Yet" description="Employee records will appear here once added." />
      </div>
    </div>
  );
}
