'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, PackageCheck, AlertCircle, Info, Hash, MapPin, User, Building2, Check } from 'lucide-react';
import { Asset, AssetCondition, ASSET_CONDITION_LABELS } from '@/constants/assets';
import { COMMON_RETURN_LOCATIONS } from '@/constants/returns';
import assetService from '@/services/asset.service';
import returnService from '@/services/return.service';
import { useToast } from '@/components/ui/Toast';

interface WalkInReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CONDITIONS: AssetCondition[] = ['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'DAMAGED'];

export default function WalkInReturnModal({
  isOpen,
  onClose,
  onSuccess,
}: WalkInReturnModalProps) {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingAssets, setMatchingAssets] = useState<Asset[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const [conditionOnReturn, setConditionOnReturn] = useState<AssetCondition>('GOOD');
  const [locationPreset, setLocationPreset] = useState<string>('ICT Asset Store');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search assigned assets when user types
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setMatchingAssets([]);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        setError(null);
        const res = await assetService.getAll({
          status: 'ASSIGNED',
          search: trimmed,
          limit: 10,
        });

        if (isMounted && res.success) {
          // Filter to only those with active assignments
          const assignedOnly = (res.data || []).filter(
            (a) => a.status === 'ASSIGNED' && a.currentAssignment
          );
          setMatchingAssets(assignedOnly);
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Failed to search assigned assets');
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, searchQuery]);

  // Reset modal state on open/close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setMatchingAssets([]);
      setSelectedAsset(null);
      setConditionOnReturn('GOOD');
      setLocationPreset('ICT Asset Store');
      setCustomLocation('');
      setNotes('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const returnLocation = locationPreset === 'OTHER' ? customLocation.trim() : locationPreset;

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setConditionOnReturn(asset.condition || 'GOOD');
    setError(null);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) {
      setError('Please search and select an assigned asset.');
      return;
    }

    if (!returnLocation) {
      setError('Please specify the store/warehouse location where the asset is returned.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await returnService.walkIn({
        assetId: selectedAsset.id,
        conditionOnReturn,
        returnLocation,
        notes: notes.trim() || undefined,
      });

      toast.success(`Direct walk-in return completed! ${selectedAsset.assetCode} is now AVAILABLE.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to process walk-in return';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentHolderName =
    selectedAsset?.currentAssignment?.employeeName || 'Unknown Holder';

  const departmentName =
    selectedAsset?.currentAssignment?.departmentName ||
    selectedAsset?.department?.name ||
    'Department Unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-eec-primary/10 text-eec-primary">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Receive Walk-in Asset Return</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct physical return without a prior return request.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Asset Search Section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Search Assigned Asset <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by asset tag, serial number, brand, or model..."
                disabled={isSubmitting}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-800"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-eec-primary rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Results Dropdown / Picker */}
            {searchQuery.trim().length > 0 && (
              <div className="mt-2 max-h-44 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-xs divide-y divide-slate-100">
                {matchingAssets.length === 0 && !isSearching ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No assigned assets found matching &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  matchingAssets.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    const holder = asset.currentAssignment?.employeeName || 'Unknown';

                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => handleSelectAsset(asset)}
                        className={`w-full text-left p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                          isSelected
                            ? 'bg-eec-primary/5 text-eec-primary font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-eec-primary">{asset.assetCode}</span>
                            <span className="text-slate-400 font-normal">•</span>
                            <span className="font-semibold text-slate-800">{asset.name}</span>
                          </div>
                          <div className="text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>SN: {asset.serialNumber}</span>
                            <span>•</span>
                            <span>Holder: {holder}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-eec-primary shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Selected Asset Details Card */}
          {selectedAsset && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                  {selectedAsset.assetCode}
                </span>
                <span className="text-emerald-700 font-semibold uppercase text-2xs tracking-wider bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Current Status: ASSIGNED
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">{selectedAsset.name}</div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Current Holder:</span>
                  <span className="font-medium text-slate-800">{currentHolderName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Department:</span>
                  <span className="font-medium text-slate-800">{departmentName}</span>
                </div>
              </div>
              <div className="pt-1 text-slate-500 text-2xs">
                Current Location: <span className="font-medium text-slate-700">{selectedAsset.location || 'Not set'}</span>
              </div>
            </div>
          )}

          {/* Form fields for return */}
          {selectedAsset && (
            <form onSubmit={handleConfirm} id="walk-in-return-form" className="space-y-4 pt-1">
              {/* Return Condition */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Return Condition <span className="text-rose-500">*</span>
                </label>
                <select
                  value={conditionOnReturn}
                  onChange={(e) => setConditionOnReturn(e.target.value as AssetCondition)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-800"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Physical Storage Location <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    value={locationPreset}
                    onChange={(e) => setLocationPreset(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-800"
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
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder="Enter specific room, rack, or shelf location..."
                        disabled={isSubmitting}
                        className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Receiving & Inspection Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Employee brought directly to store. Device in working order..."
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-800 placeholder-slate-400"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0">
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
            form="walk-in-return-form"
            disabled={isSubmitting || !selectedAsset || !returnLocation}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Walk-in Return...
              </>
            ) : (
              <>
                <PackageCheck className="w-4 h-4" />
                Confirm Walk-in Receipt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
