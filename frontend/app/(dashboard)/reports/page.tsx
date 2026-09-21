import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Generate and export asset management reports and analytics." />
      <div className="eec-card">
        <EmptyState icon={BarChart3} title="No Reports Generated" description="Reports and data exports will appear here." />
      </div>
    </div>
  );
}
