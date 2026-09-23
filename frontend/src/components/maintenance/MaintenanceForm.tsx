'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Wrench,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import assetService from '@/services/asset.service';
import employeeService from '@/services/employee.service';
import maintenanceService, { MaintenanceTechnician } from '@/services/maintenance.service';
import { Asset } from '@/constants/assets';
import { Employee } from '@/constants/employees';
import {
  MaintenanceTicket,
  IssueCategory,
  MaintenancePriority,
  ISSUE_CATEGORY_LABELS,
  MAINTENANCE_PRIORITY_LABELS,
} from '@/constants/maintenance';

interface MaintenanceFormProps {
  mode: 'create' | 'edit';
  initialData?: MaintenanceTicket;
  preselectedAssetId?: string;
}

export default function MaintenanceForm({
  mode,
  initialData,
  preselectedAssetId,
}: MaintenanceFormProps) {
  const router = useRouter();
  const toast = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [technicians, setTechnicians] = useState<MaintenanceTechnician[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form states
  const [assetId, setAssetId] = useState(
    initialData?.assetId || preselectedAssetId || ''
  );
  const [category, setCategory] = useState<IssueCategory>(
    (initialData?.category as IssueCategory) || 'HARDWARE'
  );
  const [priority, setPriority] = useState<MaintenancePriority>(
    initialData?.priority || 'MEDIUM'
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [reportedBy, setReportedBy] = useState(initialData?.reportedBy || '');
  const [assignedTechnician, setAssignedTechnician] = useState(
    initialData?.assignedTechnician || ''
  );
  const [cost, setCost] = useState<string>(
    initialData?.cost !== undefined && initialData?.cost !== null
      ? String(initialData.cost)
      : ''
  );
  const [startDate, setStartDate] = useState(
    initialData?.startDate
      ? new Date(initialData.startDate).toISOString().substring(0, 10)
      : new Date().toISOString().substring(0, 10)
  );
  const [resolutionNotes, setResolutionNotes] = useState(
    initialData?.resolutionNotes || ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadDependencies() {
      try {
        setLoadingInitial(true);
        const [assetRes, empRes, techRes] = await Promise.all([
          assetService.getAll({ limit: 100 }),
          employeeService.getAll({ status: 'active', limit: 100 }).catch(() => ({ success: false, data: [] })),
          maintenanceService.getTechnicians().catch(() => ({ success: false, data: [] })),
        ]);

        if (assetRes.success) setAssets(assetRes.data);
        if (empRes.success) {
          setEmployees(empRes.data);
          // If in create mode and reportedBy is empty, auto-fill with first employee if only 1 (e.g. employee portal)
          if (!initialData?.reportedBy && empRes.data.length === 1) {
            setReportedBy(`${empRes.data[0].firstName} ${empRes.data[0].lastName}`);
          }
        }
        if (techRes.success) {
          setTechnicians(techRes.data);
        }
      } catch {
        toast.error('Failed to load assets or employee records');
      } finally {
        setLoadingInitial(false);
      }
    }

    loadDependencies();
  }, [toast, initialData?.reportedBy]);

  // Selected asset
  const selectedAsset = assets.find((a) => a.id === assetId) || initialData?.asset;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetId) {
      toast.error('Please select an asset for this ticket');
      return;
    }

    if (!reportedBy.trim()) {
      toast.error('Please enter or select who reported this issue');
      return;
    }

    if (!assignedTechnician.trim()) {
      toast.error('Please assign an IT Technician');
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      toast.error('Please provide a detailed issue description (min 5 chars)');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        const payload = {
          assetId,
          category,
          priority,
          description: description.trim(),
          reportedBy: reportedBy.trim(),
          assignedTechnician: assignedTechnician.trim(),
          cost: cost ? parseFloat(cost) : null,
          startDate: startDate ? new Date(startDate).toISOString() : null,
        };

        const res = await maintenanceService.create(payload);
        if (res.success) {
          toast.success('Maintenance ticket created successfully');
          router.push(`/maintenance/${res.data.id}`);
        } else {
          toast.error(res.message || 'Failed to create ticket');
        }
      } else if (initialData) {
        const payload = {
          category,
          priority,
          description: description.trim(),
          reportedBy: reportedBy.trim(),
          assignedTechnician: assignedTechnician.trim(),
          cost: cost ? parseFloat(cost) : null,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          resolutionNotes: resolutionNotes.trim() || null,
        };

        const res = await maintenanceService.update(initialData.id, payload);
        if (res.success) {
          toast.success('Maintenance ticket updated successfully');
          router.push(`/maintenance/${initialData.id}`);
        } else {
          toast.error(res.message || 'Failed to update ticket');
        }
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Submission failed';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-eec-primary animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Loading assets and personnel data...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-eec-primary/10 text-eec-primary flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {mode === 'create' ? 'Register Maintenance Request' : `Edit Ticket: ${initialData?.ticketNumber}`}
            </h2>
            <p className="text-xs text-slate-500">
              Provide incident details and assign an IT technician for testing & repair
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Asset Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Asset to Maintain <span className="text-rose-500">*</span>
            </label>
            {mode === 'create' ? (
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                disabled={!!preselectedAssetId}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">-- Choose an asset --</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.assetCode}] {a.name} — {a.category} ({a.status})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">
                    {selectedAsset?.name || 'Asset'}
                  </span>{' '}
                  <span className="font-mono text-xs text-slate-500">
                    ({selectedAsset?.assetCode})
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                  {selectedAsset?.category}
                </span>
              </div>
            )}

            {/* Asset Preview Card */}
            {selectedAsset && (
              <div className="mt-3 p-4 bg-blue-50/60 border border-blue-100 rounded-lg flex flex-wrap gap-4 text-xs text-blue-900">
                <div>
                  <span className="text-blue-600 block font-medium">Model / Brand:</span>
                  <span className="font-semibold">
                    {selectedAsset.brand} {selectedAsset.model || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600 block font-medium">Serial Number:</span>
                  <span className="font-mono font-semibold">
                    {selectedAsset.serialNumber || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600 block font-medium">Current Status:</span>
                  <span className="font-semibold uppercase tracking-wider">
                    {selectedAsset.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Issue Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white"
                required
              >
                {Object.entries(ISSUE_CATEGORY_LABELS).map(([catKey, label]) => (
                  <option key={catKey} value={catKey}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Priority Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white"
                required
              >
                {Object.entries(MAINTENANCE_PRIORITY_LABELS).map(([prioKey, label]) => (
                  <option key={prioKey} value={prioKey}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* People: Reported By & Assigned Technician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Reported By <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) setReportedBy(e.target.value);
                  }}
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white"
                  defaultValue=""
                >
                  <option value="">-- Select from Employees or type below --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId}) — {emp.department?.name || 'No Dept'}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  placeholder="Or enter reporter full name"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Assigned IT Technician <span className="text-rose-500">*</span>
              </label>
              <select
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white disabled:bg-slate-50 disabled:text-slate-400"
                required
                disabled={technicians.length === 0}
              >
                <option value="">
                  {technicians.length === 0
                    ? 'No active IT technicians available'
                    : '-- Choose IT Technician --'}
                </option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={`${tech.firstName} ${tech.lastName}`}>
                    {tech.firstName} {tech.lastName} ({tech.employeeId} - {tech.department?.name || 'ICT Directorate'})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Only active IT Technicians should diagnose and repair hardware/software issues.
              </p>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Issue & Defect Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe symptoms, error codes, damage, or recent events causing the failure..."
              className="w-full p-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary"
              required
            />
          </div>

          {/* Dates & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Maintenance Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Estimated / Actual Cost (ETB)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary"
              />
            </div>
          </div>

          {/* Resolution Notes (edit mode) */}
          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Resolution & Repair Notes
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Summary of repair actions performed, components replaced, or troubleshooting results..."
                className="w-full p-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-eec-primary text-white text-sm font-medium hover:bg-eec-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'create' ? 'Create Ticket' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
