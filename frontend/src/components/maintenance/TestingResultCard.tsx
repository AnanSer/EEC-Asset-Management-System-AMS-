'use client';

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  User,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { InspectionTest } from '@/constants/maintenance';

interface TestingResultCardProps {
  test: InspectionTest;
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

export default function TestingResultCard({ test }: TestingResultCardProps) {
  const isPassed = test.passed || test.result === 'PASS' || test.status === 'PASSED';

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isPassed
          ? 'bg-emerald-50/40 border-emerald-200'
          : 'bg-rose-50/40 border-rose-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isPassed ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              {test.testType || 'Quality Inspection'}
            </h4>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(test.testDate || test.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Inspector: {test.testedBy}
              </span>
            </div>
          </div>
        </div>

        <StatusBadge
          status={isPassed ? 'pass' : 'fail'}
          label={isPassed ? 'PASSED' : 'FAILED'}
        />
      </div>

      {test.findings && (
        <div className="mt-3 text-xs text-slate-700 bg-white/70 rounded-lg p-2.5 border border-slate-200/60">
          <span className="font-semibold text-slate-900 block mb-0.5">Findings:</span>
          {test.findings}
        </div>
      )}

      {test.recommendations && (
        <div className="mt-2 text-xs text-slate-700 bg-white/70 rounded-lg p-2.5 border border-slate-200/60">
          <span className="font-semibold text-slate-900 block mb-0.5">
            Recommendations:
          </span>
          {test.recommendations}
        </div>
      )}
    </div>
  );
}
