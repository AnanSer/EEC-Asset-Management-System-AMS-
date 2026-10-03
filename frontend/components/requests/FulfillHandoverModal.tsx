'use client';

import React, { useState, useEffect } from 'react';
import { X, PackageCheck, AlertCircle, Loader2, Info, Check, PackageOpen } from 'lucide-react';
import { AssetRequest } from '@/constants/requests';
import {
  Asset,
  AssetCondition,
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
} from '@/constants/assets';
import assetService from '@/services/asset.service';
import requestService from '@/services/request.service';
import { useToast } from '@/components/ui/Toast';

interface FulfillHandoverModalProps {
  request: AssetRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CONDITIONS: AssetCondition[] = ['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR'];

export default function FulfillHandoverModal({
  request,
  isOpen,
  onClose,
  onSuccess,
}: FulfillHandoverModalProps) {
  const toast = useToast();
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [condition, setCondition] = useState<AssetCondition>('GOOD');
  const [notes, setNotes] = useState('');
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !request) return;

    let isMounted = true;
    const fetchAssets = async () => {
      try {
        setIsLoadingAssets(true);
        setError(null);
        setSelectedAssetId('');

        const res = await assetService.getAll({
          status: 'AVAILABLE',
          category: request.category,
          limit: 100,
        });

        if (isMounted && res.success) {
          const list = res.data || [];
          setAvailableAssets(list);
          if (list.length > 0) {
            setSelectedAssetId(list[0].id);
            setCondition(list[0].condition || 'GOOD');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          const msg = err?.response?.data?.message || 'Failed to fetch available assets in inventory';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAssets(false);
        }
      }
    };

    fetchAssets();

    return () => {
      isMounted = false;
    };
  }, [isOpen, request]);

  if (!isOpen || !request) return null;

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAssetId(asset.id);
    setCondition(asset.condition || 'GOOD');
  };

  const handleFulfill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) {
      setError('Please select an available asset to physically hand over.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await requestService.fulfill(request.id, {
        assetId: selectedAssetId,
        conditionOnAssign: condition,
        handoverNotes: notes.trim() || undefined,
      });

      const chosenAsset = availableAssets.find((a) => a.id === selectedAssetId);
      toast.success(
        `Asset ${chosenAsset?.assetCode || ''} successfully handed over and assigned to ${request.requester.firstName} ${request.requester.lastName}!`
      );
      setNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to complete physical handover';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryLabel = ASSET_CATEGORY_LABELS[request.category] || request.category;
  const requesterName = `${request.requester.firstName} ${request.requester.lastName}`;
  const selectedAsset = availableAssets.find((a) => a.id === selectedAssetId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Physical Asset Handover</h3>
              <p className="text-xs text-slate-500 font-mono">Request: {request.requestNumber}</p>
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

        {/* Scrollable Content */}
        <form onSubmit={handleFulfill} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Request Details */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block">Recipient:</span>
                <span className="font-semibold text-slate-800">
                  {requesterName} ({request.requester.employeeId})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Department:</span>
                <span className="font-semibold text-slate-800">{request.department?.name}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
              <span className="text-slate-500">Required Category:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {categoryLabel}
              </span>
            </div>
            {request.approvalRemarks && (
              <div className="pt-1 text-[11px] text-blue-700 bg-blue-50/80 p-2 rounded-lg border border-blue-100">
                <span className="font-semibold">Admin Approval Note:</span> {request.approvalRemarks}
              </div>
            )}
          </div>

          {/* Unit Selection Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Physical Unit from Store <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-500">
                {isLoadingAssets
                  ? 'Checking inventory...'
                  : `${availableAssets.length} unit(s) available`}
              </span>
            </div>

            {isLoadingAssets ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-eec-primary mx-auto" />
                <p className="text-xs text-slate-500">Loading available {categoryLabel} assets...</p>
              </div>
            ) : availableAssets.length === 0 ? (
              <div className="p-6 text-center bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                <PackageOpen className="w-8 h-8 text-amber-600 mx-auto" />
                <h4 className="text-sm font-bold text-amber-900">No Available Units</h4>
                <p className="text-xs text-amber-700 max-w-sm mx-auto">
                  There are currently 0 available {categoryLabel} units in store inventory. A unit must be registered or returned before handover can proceed.
                </p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/40">
                {availableAssets.map((asset) => {
                  const isSelected = asset.id === selectedAssetId;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleAssetSelect(asset)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {asset.assetCode}
                          </span>
                          <span className="text-xs font-medium text-slate-700 truncate">
                            {asset.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                          {asset.brand && <span>Brand: {asset.brand}</span>}
                          {asset.model && <span>Model: {asset.model}</span>}
                          <span>S/N: {asset.serialNumber}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {ASSET_CONDITION_LABELS[asset.condition] || asset.condition}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Condition and Handover Notes */}
          {selectedAsset && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Handover Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as AssetCondition)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-slate-800"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {ASSET_CONDITION_LABELS[cond]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Handover Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="e.g., Handed over with charger & mouse"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Process Explanatory Alert */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-900 text-[11px] leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <span className="font-semibold">Handover Effect:</span> Confirming physical handover will immediately update the asset status from <span className="font-semibold">AVAILABLE</span> to <span className="font-semibold">ASSIGNED</span>, create an active assignment record, update store inventory counts, and mark this request as <span className="font-semibold">FULFILLED</span>.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
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
              disabled={isSubmitting || !selectedAssetId || availableAssets.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PackageCheck className="w-3.5 h-3.5" />
              )}
              {isSubmitting ? 'Confirming Handover...' : 'Confirm Physical Handover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
