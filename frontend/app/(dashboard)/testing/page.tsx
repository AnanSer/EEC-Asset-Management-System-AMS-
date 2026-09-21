import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { FlaskConical } from 'lucide-react';

export default function TestingPage() {
  return (
    <div>
      <PageHeader title="Testing" description="Manage assets currently under quality and acceptance testing." />
      <div className="eec-card">
        <EmptyState icon={FlaskConical} title="No Testing Records" description="Assets under testing will be tracked here." />
      </div>
    </div>
  );
}
