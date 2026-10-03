'use client';

import React, { useState } from 'react';
import { X, PackageCheck, AlertCircle, Info, Hash, MapPin } from 'lucide-react';
import { AssetReturnRequest, COMMON_RETURN_LOCATIONS } from '@/constants/returns';
import { AssetCondition, ASSET_CONDITION_LABELS } from '@/constants/assets';
import returnService from '@/services/return.service';
import { useToast } from '@/components/ui/Toast';

interface ReceiveReturnModalProps {
  request: AssetReturnRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CONDITIONS: AssetCondition[] = ['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'DAMAGED'];

export default function ReceiveReturnModal({
  request,
  isOpen,
  onClose,
  onSuccess,
}: ReceiveReturnModalProps) {
  const toast = useToast();
  const [conditionOnReturn, setConditionOnReturn] = useState<AssetCondition>('GOOD');
  const [locationPreset, setLocationPreset] = useState<string>('ICT Asset Store');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const returnLocation = locationPreset === 'OTHER' ? customLocation.trim() : locationPreset;

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnLocation) {
      setError('Please specify the store/warehouse location where the asset is physically placed.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await returnService.receive(request.id, {
        conditionOnReturn,
        returnLocation,
        notes: notes.trim() || undefined,
      });

      toast.success(`Asset ${request.asset.assetCode} received! Status changed to AVAILABLE.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to receive asset return';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requesterName = request.requester
    ? `${request.requester.firstName} ${request.requester.lastName}`
    : 'Unknown Employee';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate">Receive & Inspect Asset</h3>
              <p className="text-[11px] text-slate-500 truncate font-mono">
                Request #{request.requestNumber}
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
        <form onSubmit={handleReceive} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 text-xs">
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Asset & Custody Information */}
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="font-semibold text-eec-primary bg-eec-primary/10 px-1.5 py-0.5 rounded">
                  {request.asset.assetCode}
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-400" />
                  {request.asset.serialNumber}
                </span>
              </div>
              <div className="font-semibold text-slate-800 text-xs truncate">{request.asset.name}</div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
                <div className="truncate">
                  <span className="text-slate-400">Holder:</span>{' '}
                  <span className="font-medium text-slate-700">{requesterName}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-400">Dept:</span>{' '}
                  <span className="font-medium text-slate-700">{request.department.name}</span>
                </div>
              </div>
              {request.reason && (
                <div className="pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
                  <span className="text-slate-400">Reason:</span>{' '}
                  <span className="font-medium text-slate-800">{request.reason}</span>
                </div>
              )}
            </div>

            {/* Notice */}
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-2 text-emerald-950 text-[11px] leading-relaxed">
              <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Event:</span> Receipt closes assignment, records condition, stores unit, and changes status to <span className="font-bold text-emerald-700">AVAILABLE</span>.
              </div>
            </div>

            {/* Condition On Return */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Inspected Condition <span className="text-rose-500">*</span>
              </label>
              <select
                value={conditionOnReturn}
                onChange={(e) => setConditionOnReturn(e.target.value as AssetCondition)}
                disabled={isSubmitting}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-800"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {ASSET_CONDITION_LABELS[cond]}
                  </option>
                ))}
              </select>
            </div>

            {/* Return Location */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Physical Storage Location <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-1.5">
                <select
                  value={locationPreset}
                  onChange={(e) => setLocationPreset(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-800"
                >
                  {COMMON_RETURN_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                  <option value="OTHER">Other / Custom Location...</option>
                </select>

                {locationPreset === 'OTHER' && (
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Enter room, rack, or shelf location..."
                      disabled={isSubmitting}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-800"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Inspection & Handover Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Included accessories, chargers, scratch or defect observations..."
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
              disabled={isSubmitting || !returnLocation}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Receiving Asset...
                </>
              ) : (
                <>
                  <PackageCheck className="w-3.5 h-3.5" />
                  Confirm Receipt
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
