'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus, ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import StatusBadge from '@/components/ui/StatusBadge';
import assignmentService from '@/services/assignment.service';
import assetService from '@/services/asset.service';
import { AssetAssignment } from '@/constants/assignments';
import { Asset, ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '@/constants/assets';
import AssignmentHistory from '@/components/assignments/AssignmentHistory';

export default function AssetAssignmentHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const assetId = String(params.assetId);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [assetRes, historyRes] = await Promise.all([
        assetService.getById(assetId),
        assignmentService.getHistory(assetId),
      ]);

      if (assetRes.success) setAsset(assetRes.data);
      if (historyRes.success) setHistory(historyRes.data);
    } catch {
      toast.error('Failed to load asset assignment history');
      router.push('/assignments');
    } finally {
      setLoading(false);
    }
  }, [assetId, router, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Asset History"
          description="Loading custody and allocation records..."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Assignments', href: '/assignments' },
            { label: 'History' },
          ]}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!asset) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Custody History: ${asset.name}`}
        description={`Tracking all past and active assignment records for ${asset.assetCode}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Assets', href: '/assets' },
          { label: asset.name, href: `/assets/${asset.id}` },
          { label: 'Assignment History' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              href={`/assets/${asset.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              Asset Details
            </Link>
            {asset.status === 'AVAILABLE' && (
              <Link
                href={`/assignments/new?assetId=${asset.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-eec-primary text-white text-xs font-semibold hover:bg-eec-primary/90 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Assign Asset
              </Link>
            )}
          </div>
        }
      />

      {/* Asset Summary Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-eec-primary/10 text-eec-primary flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-eec-text">{asset.name}</h3>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-eec-primary/10 text-eec-primary border border-eec-primary/20">
                {asset.assetCode}
              </span>
              <StatusBadge
                status={asset.status.toLowerCase()}
                label={ASSET_STATUS_LABELS[asset.status] ?? asset.status}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Category: <strong className="text-slate-700">{ASSET_CATEGORY_LABELS[asset.category]}</strong> · Serial:{' '}
              <span className="font-mono">{asset.serialNumber}</span>
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500">
          <p>Total recorded custody assignments: <strong className="text-slate-800">{history.length}</strong></p>
        </div>
      </div>

      {/* History Timeline/Table */}
      <AssignmentHistory history={history} />
    </div>
  );
}
