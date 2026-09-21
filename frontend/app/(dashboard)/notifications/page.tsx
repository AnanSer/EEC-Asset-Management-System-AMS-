import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader title="Notifications" description="View system alerts, warranty expiries, and activity updates." />
      <div className="eec-card">
        <EmptyState icon={Bell} title="No Notifications" description="System notifications and alerts will appear here." />
      </div>
    </div>
  );
}
