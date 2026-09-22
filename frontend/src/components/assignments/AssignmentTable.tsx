'use client';

import React from 'react';
import Link from 'next/link';
import {
  Eye,
  History,
  ArrowRightLeft,
  RotateCcw,
  Calendar,
  User,
  Package,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { AssetAssignment } from '@/constants/assignments';

interface AssignmentTableProps {
  assignments: AssetAssignment[];
  onTransfer?: (assignment: AssetAssignment) => void;
  onReturn?: (assignment: AssetAssignment) => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function AssignmentTable({
  assignments,
  onTransfer,
  onReturn,
}: AssignmentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="px-5 py-3.5">Asset</th>
            <th className="px-5 py-3.5">Employee</th>
            <th className="px-5 py-3.5">Department</th>
            <th className="px-5 py-3.5">Assigned Date</th>
            <th className="px-5 py-3.5">Returned Date</th>
            <th className="px-5 py-3.5">Current Custody</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {assignments.map((assignment) => {
            const asset = assignment.asset;
            const employee = assignment.employee;
            const department = employee?.department || asset?.department;

            return (
              <tr
                key={assignment.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* Asset Column */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-eec-primary/10 text-eec-primary flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <Link
                        href={`/assets/${assignment.assetId}`}
                        className="font-semibold text-eec-text hover:text-eec-accent transition-colors block"
                      >
                        {asset?.name || 'Unknown Asset'}
                      </Link>
                      <span className="font-mono text-xs text-slate-500">
                        {asset?.assetCode || '—'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Employee Column */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div>
                      {employee ? (
                        <Link
                          href={`/employees/${employee.id}`}
                          className="font-medium text-slate-800 hover:text-eec-primary transition-colors block text-xs"
                        >
                          {employee.fullName}
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {employee?.employeeId || '—'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Department Column */}
                <td className="px-5 py-4 text-xs text-slate-600 font-medium">
                  {department?.name || 'Unassigned'}
                </td>

                {/* Assigned Date */}
                <td className="px-5 py-4 text-xs text-slate-600 whitespace-nowrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(assignment.assignedDate)}
                  </span>
                </td>

                {/* Returned Date */}
                <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                  {assignment.returnedDate ? (
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(assignment.returnedDate)}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">In Possession</span>
                  )}
                </td>

                {/* Current Custody Badge */}
                <td className="px-5 py-4">
                  <StatusBadge
                    status={assignment.isCurrent ? 'active' : 'inactive'}
                    label={assignment.isCurrent ? 'Yes' : 'Returned'}
                  />
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/assets/${assignment.assetId}`}
                      title="View Asset Details"
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-eec-primary transition"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/assignments/history/${assignment.assetId}`}
                      title="View Assignment History"
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-eec-primary transition"
                    >
                      <History className="w-4 h-4" />
                    </Link>
                    {assignment.isCurrent && onTransfer && (
                      <button
                        type="button"
                        onClick={() => onTransfer(assignment)}
                        title="Transfer to Another Employee"
                        className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                    )}
                    {assignment.isCurrent && onReturn && (
                      <button
                        type="button"
                        onClick={() => onReturn(assignment)}
                        title="Return to Inventory"
                        className="p-1.5 rounded-md hover:bg-amber-50 text-amber-600 transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
