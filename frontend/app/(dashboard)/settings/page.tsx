import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Configure system preferences, roles, and permissions." />
      <div className="eec-card">
        <EmptyState icon={Settings} title="Settings Coming Soon" description="System configuration options will be available in Phase 2." />
      </div>
    </div>
  );
}
