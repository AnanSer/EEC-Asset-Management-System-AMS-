import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';

export default function AssetsPage() {
  return (
    <div>
      <PageHeader title="Assets" description="Register, track, and manage all organizational assets." />
      <div className="eec-card">
        <EmptyState icon={Package} title="No Assets Registered" description="Assets will appear here once they are registered in the system." />
      </div>
    </div>
  );
}
