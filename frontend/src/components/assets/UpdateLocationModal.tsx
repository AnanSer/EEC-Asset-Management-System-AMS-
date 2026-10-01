'use client';

import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import LoadingButton from '@/components/ui/LoadingButton';
import { useToast } from '@/components/ui/Toast';
import assetService from '@/services/asset.service';

interface UpdateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    id: string;
    assetCode: string;
    name: string;
    location?: string | null;
  };
  onSuccess: () => void;
}

const COMMON_LOCATIONS = [
  'ICT Asset Store',
  'Main Warehouse',
  'Engineering Store',
  'ICT Directorate',
  'Water & Irrigation Engineering Sector',
  'Finance Directorate',
  'Human Resources Directorate',
];

export default function UpdateLocationModal({
  isOpen,
  onClose,
  asset,
  onSuccess,
}: UpdateLocationModalProps) {
  const toast = useToast();
  const [location, setLocation] = useState(asset.location || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const res = await assetService.updateLocation(
        asset.id,
        location.trim() || null
      );

      if (res.success) {
        toast.success(
          `Location updated for ${asset.assetCode} to "${location.trim() || 'Unassigned'}"`
        );
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Failed to update physical custody location';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-eec-primary/10 flex items-center justify-center text-eec-primary">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Update Physical Location
              </h3>
              <p className="text-xs text-slate-400">
                {asset.assetCode} · {asset.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Current / New Physical Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. ICT Asset Store, Shelf B-12"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary transition"
              autoFocus
            />
            <p className="text-xs text-slate-400 mt-1">
              Physical custody or store location for this individual unit.
            </p>
          </div>

          {/* Quick suggestions */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">
              Quick Select Common Locations:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition ${
                    location === loc
                      ? 'bg-eec-primary text-white border-eec-primary'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              className="px-4 py-2 rounded-lg bg-eec-primary text-white text-xs font-semibold hover:bg-eec-primary/90 transition shadow-xs"
            >
              Save Location
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
