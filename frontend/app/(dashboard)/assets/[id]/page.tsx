'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import assetService from '@/services/asset.service';
import { Asset } from '@/constants/assets';
import AssetDetails from '@/components/assets/AssetDetails';

export default function AssetDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const toast = useToast();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAsset = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await assetService.getById(id);
      if (res.success) setAsset(res.data);
    } catch {
      toast.error('Asset not found');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

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

      <AssetDetails asset={asset} onRefresh={loadAsset} />
    </div>
  );
}
