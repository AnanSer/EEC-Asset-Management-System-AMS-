'use client';

import React, { useState } from 'react';
import { X, RotateCcw, AlertCircle, Info, ShieldCheck, Hash } from 'lucide-react';
import { Asset } from '@/constants/assets';
import returnService from '@/services/return.service';
import { useToast } from '@/components/ui/Toast';

interface RequestReturnModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_REASONS = [
  'Project / Task Completed',
  'Employee Transfer / Department Change',
  'Hardware Upgrade',
  'Faulty / Malfunctioning Equipment',
  'No Longer Required',
];

export default function RequestReturnModal({
  asset,
  isOpen,
  onClose,
  onSuccess,
}: RequestReturnModalProps) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for returning this asset.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await returnService.create({
        assetId: asset.id,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      });

      toast.success('Asset return request submitted. Please physically hand over the asset to the Store Keeper.');
      setReason('');
      setNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to submit return request';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-eec-primary/10 text-eec-primary shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate">Request Asset Return</h3>
              <p className="text-[11px] text-slate-500 truncate">
                Initiate return request for assigned equipment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 text-xs">
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Asset Summary Card */}
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="font-semibold text-eec-primary bg-eec-primary/10 px-1.5 py-0.5 rounded">
                  {asset.assetCode}
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-400" />
                  {asset.serialNumber}
                </span>
              </div>
              <div className="font-semibold text-slate-800 text-xs truncate">{asset.name}</div>
              <div className="text-slate-500 text-[11px] truncate">
                {asset.brand ? `${asset.brand} ` : ''}{asset.model || ''} • {asset.category}
              </div>
            </div>

            {/* Workflow Notice / Disclaimer */}
            <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2 text-blue-900 text-[11px] leading-relaxed">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Notice:</span> Requesting return doesn&apos;t change inventory. The asset remains in your custody until physically received and inspected by the Store Keeper.
              </div>
            </div>

            {/* Return Reason */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Reason for Return <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {[
                  'Task Completed',
                  'Department Transfer',
                  'Hardware Upgrade',
                  'Defective / Damaged',
                  'No Longer Needed',
                ].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    disabled={isSubmitting}
                    className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                      reason === r
                        ? 'bg-eec-primary text-white border-eec-primary shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the reason for returning this asset..."
                disabled={isSubmitting}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Additional Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include charger, cable condition, physical damage notes..."
                disabled={isSubmitting}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/60 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-eec-primary hover:bg-eec-primary/90 focus:outline-none focus:ring-2 focus:ring-eec-primary/30 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
