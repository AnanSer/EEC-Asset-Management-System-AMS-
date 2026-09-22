'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Loader2, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import employeeService from '@/services/employee.service';
import assignmentService from '@/services/assignment.service';
import { Employee } from '@/constants/employees';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    id: string;
    assetCode: string;
    name: string;
    currentHolderName?: string;
    currentEmployeeId?: string;
  };
  onSuccess: () => void;
}

export default function TransferModal({
  isOpen,
  onClose,
  asset,
  onSuccess,
}: TransferModalProps) {
  const toast = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [transferDate, setTransferDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadActiveEmployees() {
      try {
        setLoadingEmployees(true);
        const res = await employeeService.getAll({ status: 'active', limit: 100 });
        if (res.success) {
          // Filter out current holder if present
          const eligible = res.data.filter(
            (e) => e.id !== asset.currentEmployeeId
          );
          setEmployees(eligible);
        }
      } catch {
        toast.error('Failed to load eligible employees');
      } finally {
        setLoadingEmployees(false);
      }
    }

    loadActiveEmployees();
  }, [isOpen, asset.currentEmployeeId, toast]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      toast.error('Please select the employee receiving this equipment.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await assignmentService.transfer(asset.id, {
        newEmployeeId: selectedEmployeeId,
        transferDate: transferDate || undefined,
        remarks: remarks.trim() || undefined,
      });

      if (res.success) {
        toast.success(
          `Asset ${asset.assetCode} successfully transferred to ${res.data.employee?.fullName}`
        );
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Failed to complete asset transfer';
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
            <div className="w-9 h-9 rounded-xl bg-eec-primary/10 text-eec-primary flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-eec-text">Transfer Asset</h3>
              <p className="text-xs text-slate-500">
                Reassign <span className="font-semibold text-eec-primary">{asset.assetCode}</span> ({asset.name})
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

        {/* Current Holder Information */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
          <p>
            <span className="font-medium text-slate-500">Current Custodian:</span>{' '}
            <strong className="text-slate-800">{asset.currentHolderName || 'Assigned Staff'}</strong>
          </p>
          <p className="text-slate-400">
            This action will automatically close the current assignment and establish a new active custody record.
          </p>
        </div>

        {/* Transfer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>New Custodian (Active Employee) *</label>
            {loadingEmployees ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-eec-accent" />
                Loading eligible employees...
              </div>
            ) : (
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">-- Select Destination Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeId}) — {emp.department?.name || 'No Department'}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className={labelClass}>Effective Transfer Date *</label>
            <input
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Transfer Remarks</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Reason for transfer, reallocated project, handover notes..."
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
              disabled={isSubmitting || loadingEmployees}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-eec-primary text-white text-xs font-semibold hover:bg-eec-primary/90 transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
