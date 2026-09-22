'use client';

import React, { useState } from 'react';
import { RotateCcw, Loader2, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import assignmentService from '@/services/assignment.service';
import { ASSET_CONDITION_LABELS } from '@/constants/assets';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    id: string;
    assetCode: string;
    name: string;
    currentHolderName?: string;
  };
  onSuccess: () => void;
}

export default function ReturnModal({
  isOpen,
  onClose,
  asset,
  onSuccess,
}: ReturnModalProps) {
  const toast = useToast();
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [conditionOnReturn, setConditionOnReturn] = useState('GOOD');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const res = await assignmentService.returnAsset(asset.id, {
        returnDate: returnDate || undefined,
        conditionOnReturn: conditionOnReturn || undefined,
        remarks: remarks.trim() || undefined,
      });

      if (res.success) {
        toast.success(
          `Asset ${asset.assetCode} returned to inventory. Status is now Available.`
        );
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Failed to return asset to inventory';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-eec-accent/40 focus:border-eec-accent transition';
  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-eec-text">Return Asset to Inventory</h3>
              <p className="text-xs text-slate-500">
                Check in <span className="font-semibold text-eec-primary">{asset.assetCode}</span> ({asset.name})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Custodian */}
        {asset.currentHolderName && (
          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 space-y-1">
            <p>
              Returning from:{' '}
              <strong className="font-semibold">{asset.currentHolderName}</strong>
            </p>
            <p className="text-amber-700">
              This will conclude the active assignment and update the asset status back to <strong>AVAILABLE</strong>.
            </p>
          </div>
        )}

        {/* Return Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Return Date *</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Condition on Return *</label>
            <select
              value={conditionOnReturn}
              onChange={(e) => setConditionOnReturn(e.target.value)}
              className={inputClass}
              required
            >
              {(Object.entries(ASSET_CONDITION_LABELS) as [string, string][]).map(
                ([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className={labelClass}>Return Remarks & Handover Notes</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Reason for return, check-in condition, accessories returned..."
              className={inputClass}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Return to Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
