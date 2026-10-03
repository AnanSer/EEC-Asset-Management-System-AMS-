'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { AssetRequest } from '@/constants/requests';
import { ASSET_CATEGORY_LABELS } from '@/constants/assets';
import requestService from '@/services/request.service';
import { useToast } from '@/components/ui/Toast';

interface ApproveRequestModalProps {
  request: AssetRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApproveRequestModal({
  request,
  isOpen,
  onClose,
  onSuccess,
}: ApproveRequestModalProps) {
  const toast = useToast();
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      await requestService.approve(request.id, {
        approvalRemarks: remarks.trim() || undefined,
      });

      toast.success(`Request ${request.requestNumber} approved! Awaiting Store Keeper physical handover.`);
      setRemarks('');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to approve request';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryLabel = ASSET_CATEGORY_LABELS[request.category] || request.category;
  const requesterName = `${request.requester.firstName} ${request.requester.lastName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Approve Asset Request</h3>
              <p className="text-xs text-slate-500 font-mono">{request.requestNumber}</p>
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

        {/* Content */}
        <form onSubmit={handleApprove} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Request Summary Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Requester:</span>
              <span className="font-semibold text-slate-800">
                {requesterName} ({request.requester.employeeId})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-800">
                {request.department?.name} ({request.department?.code})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {categoryLabel}
              </span>
            </div>
            <div className="pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 block mb-0.5">Description:</span>
              <p className="text-slate-700 font-medium">{request.description}</p>
            </div>
            {request.notes && (
              <div>
                <span className="text-slate-500 block mb-0.5">Requester Notes:</span>
                <p className="text-slate-600 italic">{request.notes}</p>
              </div>
            )}
          </div>

          {/* Critical Architecture Reminder */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-start gap-2 text-blue-800 text-[11px] leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <div>
              <span className="font-semibold">Note:</span> Approval authorizes this request. The physical asset will <span className="underline font-semibold">NOT</span> be assigned or reserved, and inventory counts will not change until the Store Keeper performs the physical handover.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Approval Remarks <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g., Approved as per IT budget allocation for Q4."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              {isSubmitting ? 'Approving...' : 'Confirm Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
