'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  User,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import testingService from '@/services/testing.service';
import {
  MaintenanceTicket,
  InspectionResult,
} from '@/constants/maintenance';

interface TestingFormProps {
  ticket: MaintenanceTicket;
  onSuccess?: () => void;
}

export default function TestingForm({ ticket, onSuccess }: TestingFormProps) {
  const router = useRouter();
  const toast = useToast();

  const [result, setResult] = useState<InspectionResult>('PASS');
  const [testedBy, setTestedBy] = useState(ticket.assignedTechnician || '');
  const [testDate, setTestDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [findings, setFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [autoComplete, setAutoComplete] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!testedBy.trim()) {
      toast.error('Please enter the name of the testing technician/inspector');
      return;
    }

    if (!findings.trim()) {
      toast.error('Please record technical inspection findings');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await testingService.create({
        ticketId: ticket.id,
        testedBy: testedBy.trim(),
        testDate: testDate ? new Date(testDate).toISOString() : null,
        result,
        findings: findings.trim(),
        recommendations: recommendations.trim() || null,
        autoComplete: result === 'PASS' ? autoComplete : false,
      });

      if (res.success) {
        if (result === 'PASS') {
          toast.success('Inspection test PASSED. Ticket marked ready / completed.');
        } else {
          toast.info('Inspection test FAILED. Ticket reverted to IN_PROGRESS for rework.');
        }

        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/maintenance/${ticket.id}`);
        }
      } else {
        toast.error(res.message || 'Failed to submit inspection record');
      }
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || err?.message || 'Inspection recording failed';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-purple-50/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Quality Inspection & Defect Verification
              </h2>
              <p className="text-xs text-slate-500">
                Record diagnostic findings to verify maintenance before returning asset to production
              </p>
            </div>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-purple-100/80 text-purple-800 font-semibold">
            {ticket.ticketNumber}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Result Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Inspection Outcome <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PASS option */}
              <button
                type="button"
                onClick={() => setResult('PASS')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  result === 'PASS'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    result === 'PASS'
                      ? 'bg-emerald-500 text-white'
                      : 'border-2 border-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">PASS (Verified)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Defects have been completely resolved. Hardware/software operates normally under testing conditions.
                  </p>
                </div>
              </button>

              {/* FAIL option */}
              <button
                type="button"
                onClick={() => setResult('FAIL')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  result === 'FAIL'
                    ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    result === 'FAIL'
                      ? 'bg-rose-500 text-white'
                      : 'border-2 border-slate-300'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">FAIL (Unresolved)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Issues persist or secondary defects detected. Reverts ticket status to In Progress for additional technician work.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Inspector & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tested By (Inspector / QA) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={testedBy}
                  onChange={(e) => setTestedBy(e.target.value)}
                  placeholder="Technician or QA Engineer name"
                  className="w-full h-11 pl-9 pr-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Inspection Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full h-11 pl-9 pr-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Technical Findings */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Technical Findings & Test Diagnostics <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Detail the benchmark tests, power cycles, connectivity checks, or component replacements observed..."
              className="w-full p-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              required
            />
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Recommendations & Preventative Actions
            </label>
            <textarea
              rows={3}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Suggestions to prevent recurrence, scheduled cleanings, or firmware updates required..."
              className="w-full p-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {/* Auto-complete checkbox if PASS */}
          {result === 'PASS' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <input
                type="checkbox"
                id="autoCompleteCheck"
                checked={autoComplete}
                onChange={(e) => setAutoComplete(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label
                htmlFor="autoCompleteCheck"
                className="text-xs font-medium text-emerald-900 cursor-pointer"
              >
                Automatically close this ticket as <strong>COMPLETED</strong> and restore asset status to Available or Assigned.
              </label>
            </div>
          )}
        </div>

        {/* Footer actions */}
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
            className={`px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 ${
              result === 'PASS'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit {result === 'PASS' ? 'Passed' : 'Failed'} Inspection
          </button>
        </div>
      </div>
    </form>
  );
}
