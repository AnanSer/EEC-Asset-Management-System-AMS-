'use client';

import React from 'react';
import Link from 'next/link';
import { User, Calendar, Clock, FileText, CheckCircle2, History } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { AssetAssignment } from '@/constants/assignments';

interface AssignmentHistoryProps {
  history: AssetAssignment[];
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

export default function AssignmentHistory({ history }: AssignmentHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="font-semibold text-slate-700">No Assignment History Recorded</p>
        <p className="text-xs text-slate-400 mt-1">
          This asset has not yet been assigned to any employee.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-eec-text uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-eec-accent" />
          Chronological Custody Records ({history.length})
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          Ordered newest to oldest
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Employee / Custodian</th>
              <th className="px-6 py-3.5">Department</th>
              <th className="px-6 py-3.5">Assigned Date</th>
              <th className="px-6 py-3.5">Returned Date</th>
              <th className="px-6 py-3.5">Duration</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Handover Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((record) => {
              const employee = record.employee;
              const department = employee?.department;

              return (
                <tr
                  key={record.id}
                  className={`transition-colors ${
                    record.isCurrent
                      ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Employee */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        {employee ? (
                          <Link
                            href={`/employees/${employee.id}`}
                            className="font-semibold text-eec-text hover:text-eec-primary transition block text-sm"
                          >
                            {employee.fullName}
                          </Link>
                        ) : (
                          <span className="text-slate-500 font-medium">Unspecified</span>
                        )}
                        <span className="font-mono text-xs text-slate-400">
                          {employee?.employeeId || '—'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 text-xs font-medium text-slate-700">
                    {department?.name || 'Unassigned Directorate'}
                  </td>

                  {/* Assigned Date */}
                  <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(record.assignedDate)}
                    </span>
                  </td>

                  {/* Returned Date */}
                  <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                    {record.returnedDate ? (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(record.returnedDate)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Present Custodian
                      </span>
                    )}
                  </td>

                  {/* Duration (days) */}
                  <td className="px-6 py-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {record.durationDays} {record.durationDays === 1 ? 'day' : 'days'}
                    </span>
                  </td>

                  {/* Custody Status Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={record.isCurrent ? 'active' : 'inactive'}
                      label={record.isCurrent ? 'Current' : 'Concluded'}
                    />
                  </td>

                  {/* Remarks */}
                  <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">
                    {record.remarks ? (
                      <p className="line-clamp-2 leading-relaxed">{record.remarks}</p>
                    ) : (
                      <span className="text-slate-400 italic">No notes</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
