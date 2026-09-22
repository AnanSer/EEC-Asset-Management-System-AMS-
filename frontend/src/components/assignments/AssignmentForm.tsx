'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Package, User, Building2, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import assetService from '@/services/asset.service';
import employeeService from '@/services/employee.service';
import assignmentService from '@/services/assignment.service';
import { Asset, ASSET_CATEGORY_LABELS } from '@/constants/assets';
import { Employee } from '@/constants/employees';

interface AssignmentFormProps {
  preselectedAssetId?: string;
  preselectedEmployeeId?: string;
}

export default function AssignmentForm({
  preselectedAssetId,
  preselectedEmployeeId,
}: AssignmentFormProps) {
  const router = useRouter();
  const toast = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [selectedAssetId, setSelectedAssetId] = useState(preselectedAssetId || '');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(preselectedEmployeeId || '');
  const [assignedDate, setAssignedDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitial(true);
        const [assetRes, empRes] = await Promise.all([
          assetService.getAll({ status: 'AVAILABLE', limit: 100 }),
          employeeService.getAll({ status: 'active', limit: 100 }),
        ]);

        if (assetRes.success) setAssets(assetRes.data);
        if (empRes.success) setEmployees(empRes.data);
      } catch {
        toast.error('Failed to load assets or employee records');
      } finally {
        setLoadingInitial(false);
      }
    }

    loadData();
  }, [toast]);

  // Find currently selected employee to auto-fill department
  const currentEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const autoFilledDepartmentName =
    currentEmployee?.department?.name || 'No department assigned';

  // Find currently selected asset for extra preview
  const currentAsset = assets.find((a) => a.id === selectedAssetId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAssetId) {
      toast.error('Please select an available equipment asset.');
      return;
    }

    if (!selectedEmployeeId) {
      toast.error('Please select an active employee recipient.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await assignmentService.assign({
        assetId: selectedAssetId,
        employeeId: selectedEmployeeId,
        assignedDate: assignedDate || undefined,
        remarks: remarks.trim() || undefined,
      });

      if (res.success) {
        toast.success(
          `Asset ${res.data.asset?.assetCode || ''} successfully assigned to ${res.data.employee?.fullName || 'employee'}!`
        );
        router.push(`/assets/${res.data.assetId}`);
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Failed to assign equipment';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-eec-accent/40 focus:border-eec-accent transition';
  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5';

  if (loadingInitial) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-eec-accent" />
        <p className="text-sm font-medium">Loading inventory & staff directories...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {/* Asset Selection Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-3">
          <Package className="w-4 h-4 text-eec-primary" /> Select Equipment
        </h3>

        <div>
          <label className={labelClass}>Available Equipment Asset *</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">-- Choose an Available Asset ({assets.length} available) --</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.assetCode}) — {ASSET_CATEGORY_LABELS[asset.category] ?? asset.category}
                {asset.serialNumber ? ` [SN: ${asset.serialNumber}]` : ''}
              </option>
            ))}
          </select>
          {assets.length === 0 && (
            <p className="text-xs text-amber-600 mt-1.5">
              No assets currently in AVAILABLE status. All registered assets are assigned, undergoing maintenance, or retired.
            </p>
          )}
        </div>

        {currentAsset && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-slate-400 block">Category:</span>
              <strong className="text-slate-700">{ASSET_CATEGORY_LABELS[currentAsset.category]}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Brand / Model:</span>
              <strong className="text-slate-700">{[currentAsset.brand, currentAsset.model].filter(Boolean).join(' ') || 'Standard'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Physical Condition:</span>
              <strong className="text-emerald-700">{currentAsset.condition}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Recipient Employee Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-eec-accent" /> Assignee &amp; Department
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Recipient Employee (Active Staff) *</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">-- Choose Active Employee ({employees.length} active) --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Allocated Department (Auto-filled)</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-medium truncate">{autoFilledDepartmentName}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Synchronized automatically from the employee profile.
            </p>
          </div>
        </div>
      </div>

      {/* Assignment Metadata Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-4 h-4 text-slate-500" /> Custody Schedule &amp; Remarks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Assigned Date *</label>
            <input
              type="date"
              value={assignedDate}
              onChange={(e) => setAssignedDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Allocation Remarks / Handover Notes</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Assigned for Field Project Alpha; includes charger & laptop bag."
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || assets.length === 0}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-eec-primary text-white text-sm font-semibold hover:bg-eec-primary/90 transition shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Recording Assignment...
            </>
          ) : (
            'Complete Assignment'
          )}
        </button>
      </div>
    </form>
  );
}
