'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useToast } from '@/components/ui/Toast';
import assetService from '@/services/asset.service';
import { Asset, AssetStatus, ASSET_STATUS_LABELS } from '@/constants/assets';
import AssetDetails from '@/components/assets/AssetDetails';

const ALL_STATUSES: AssetStatus[] = ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'TESTING', 'RETIRED', 'DISPOSED'];

export default function AssetDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const toast = useToast();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  // Status change modal
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    newStatus: string;
    isUpdating: boolean;
  }>({ open: false, newStatus: '', isUpdating: false });

  // Which status to change to — show a picker
  const [pickedStatus, setPickedStatus] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        const res = await assetService.getById(id);
        if (res.success) setAsset(res.data);
      } catch {
        toast.error('Asset not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const openStatusModal = () => {
    if (!asset) return;
    // Default to next logical status
    const current = asset.status;
    const nextMap: Record<string, string> = {
      AVAILABLE: 'ASSIGNED',
      ASSIGNED: 'AVAILABLE',
      MAINTENANCE: 'AVAILABLE',
      TESTING: 'AVAILABLE',
      RETIRED: 'AVAILABLE',
      DISPOSED: 'RETIRED',
    };
    setPickedStatus(nextMap[current] || 'AVAILABLE');
    setStatusModal({ open: true, newStatus: nextMap[current] || 'AVAILABLE', isUpdating: false });
  };

  const confirmStatusChange = async () => {
    if (!asset) return;
    try {
      setStatusModal((prev) => ({ ...prev, isUpdating: true }));
      const res = await assetService.updateStatus(asset.id, pickedStatus);
      if (res.success) {
        toast.success(`Status updated to '${ASSET_STATUS_LABELS[pickedStatus as AssetStatus] ?? pickedStatus}'`);
        setAsset((prev) => prev ? { ...prev, status: pickedStatus as AssetStatus } : prev);
        setStatusModal({ open: false, newStatus: '', isUpdating: false });
      }
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || 'Failed to update status';
      toast.error(msg);
      setStatusModal((prev) => ({ ...prev, isUpdating: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Asset Details"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Assets', href: '/assets' },
            { label: 'Loading...' },
          ]}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Asset Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Assets', href: '/assets' },
          ]}
        />
        <p className="text-slate-500">The requested asset could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={asset.name}
        description={`Asset Code: ${asset.assetCode}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Assets', href: '/assets' },
          { label: asset.name },
        ]}
      />

      <AssetDetails
        asset={asset}
        onChangeStatus={openStatusModal}
        statusLoading={statusModal.isUpdating}
      />

      {/* Status Change Modal with picker */}
      <ConfirmationModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, newStatus: '', isUpdating: false })}
        onConfirm={confirmStatusChange}
        title="Change Asset Status"
        message={
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Current status: <strong>{ASSET_STATUS_LABELS[asset.status] ?? asset.status}</strong>
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">New Status</label>
              <select
                value={pickedStatus}
                onChange={(e) => setPickedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-eec-accent/40"
              >
                {ALL_STATUSES.filter((s) => s !== asset.status).map((s) => (
                  <option key={s} value={s}>{ASSET_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
        }
        confirmLabel="Update Status"
        cancelLabel="Cancel"
        variant="warning"
        isLoading={statusModal.isUpdating}
      />
    </div>
  );
}
