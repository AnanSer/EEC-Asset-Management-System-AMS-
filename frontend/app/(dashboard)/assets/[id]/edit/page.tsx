'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import assetService from '@/services/asset.service';
import { Asset, UpdateAssetInput } from '@/constants/assets';
import AssetForm from '@/components/assets/AssetForm';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';

export default function EditAssetPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();
  const toast = useToast();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await assetService.getById(id);
        if (res.success) setAsset(res.data);
      } catch {
        toast.error('Failed to load asset');
        router.push('/assets');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmit = async (data: UpdateAssetInput) => {
    try {
      setIsSubmitting(true);
      const res = await assetService.update(id, data);
      if (res.success) {
        toast.success('Asset updated successfully');
        router.push(`/assets/${id}`);
      }
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || 'Failed to update asset';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Asset"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Assets', href: '/assets' },
            { label: 'Edit' },
          ]}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!asset) return null;

  return (
    <PermissionGuard permission={PERMISSIONS.ASSETS_UPDATE}>
      <div className="space-y-6">
        <PageHeader
          title={`Edit: ${asset.name}`}
          description={`Asset Code: ${asset.assetCode}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Assets', href: '/assets' },
            { label: asset.name, href: `/assets/${id}` },
            { label: 'Edit' },
          ]}
        />
        <AssetForm
          initialData={asset}
          onSubmit={handleSubmit as any}
          isSubmitting={isSubmitting}
        />
      </div>
    </PermissionGuard>
  );
}
