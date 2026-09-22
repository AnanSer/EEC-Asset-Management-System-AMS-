'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/Toast';
import assetService from '@/services/asset.service';
import { CreateAssetInput } from '@/constants/assets';
import AssetForm from '@/components/assets/AssetForm';

export default function NewAssetPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateAssetInput) => {
    try {
      setIsSubmitting(true);
      const res = await assetService.create(data);
      if (res.success) {
        toast.success('Asset registered successfully');
        router.push(`/assets/${res.data.id}`);
      }
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || 'Failed to register asset';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register Asset"
        description="Add a new asset to the EEC inventory."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Assets', href: '/assets' },
          { label: 'New' },
        ]}
      />
      <AssetForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
