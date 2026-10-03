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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-eec-primary/10 text-eec-primary">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Request Asset Return</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Initiate a formal return request for this assigned asset.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Asset Summary Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-eec-primary bg-eec-primary/10 px-2 py-0.5 rounded">
                {asset.assetCode}
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                {asset.serialNumber}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-800 truncate">{asset.name}</div>
            <div className="text-slate-500 text-xs">
              {asset.brand ? `${asset.brand} ` : ''}{asset.model || ''} • Category: {asset.category}
            </div>
          </div>

          {/* Workflow Notice / Disclaimer */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-blue-900 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Custody Disclaimer:</span> Submitting this request does not change the asset status or company inventory. The asset remains assigned to you until physically brought to the Store Keeper and inspected.
            </div>
          </div>

          {/* Return Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Reason for Return <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  disabled={isSubmitting}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    reason === r
                      ? 'bg-eec-primary text-white border-eec-primary'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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
              placeholder="Explain why you are returning this equipment..."
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Additional Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Any known physical defects, missing chargers/cables, or handover details..."
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-eec-primary hover:bg-eec-primary/90 focus:outline-none focus:ring-2 focus:ring-eec-primary/30 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  Submit Return Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
