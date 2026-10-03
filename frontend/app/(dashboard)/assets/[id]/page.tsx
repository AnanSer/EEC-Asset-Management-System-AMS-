'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import assetService from '@/services/asset.service';
import { Asset } from '@/constants/assets';
import AssetDetails from '@/components/assets/AssetDetails';

function AssetDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = String(params.id);
  const toast = useToast();

  const isReturnedParam =
    searchParams.get('status') === 'RETURNED' || searchParams.get('from') === 'my-assets';

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
            isReturnedParam
              ? { label: 'My Assets', href: '/my-assets' }
              : { label: 'Assets', href: '/assets' },
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
            isReturnedParam
              ? { label: 'My Assets', href: '/my-assets' }
              : { label: 'Assets', href: '/assets' },
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
          isReturnedParam
            ? { label: 'My Assets', href: '/my-assets' }
            : { label: 'Assets', href: '/assets' },
          { label: asset.name },
        ]}
      />

      <AssetDetails
        asset={asset}
        onRefresh={loadAsset}
        isReturnedView={isReturnedParam}
      />
    </div>
  );
}

export default function AssetDetailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AssetDetailContent />
    </Suspense>
  );
}
