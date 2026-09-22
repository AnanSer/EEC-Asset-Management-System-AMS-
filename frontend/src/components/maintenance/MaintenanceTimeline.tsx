'use client';

import React from 'react';
import {
  Clock,
  Wrench,
  FlaskConical,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { MaintenanceTicket } from '@/constants/maintenance';

export interface MaintenanceTimelineEvent {
  id: string;
  rawDate: Date;
  dateStr: string;
  type:
    | 'Ticket Created'
    | 'Work Started'
    | 'Moved to Testing'
    | 'Inspection Passed'
    | 'Inspection Failed'
    | 'Ticket Completed';
  statusVariant: 'open' | 'in_progress' | 'testing' | 'pass' | 'fail' | 'completed';
  description: string;
  technician?: string | null;
  notes?: string | null;
}

interface MaintenanceTimelineProps {
  ticket: MaintenanceTicket;
}

function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return '—';
  try {
    const d = new Date(date);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(date);
  }
}

export default function MaintenanceTimeline({ ticket }: MaintenanceTimelineProps) {
  const events: MaintenanceTimelineEvent[] = [];

  const createdTime = new Date(ticket.createdAt).getTime();

  // 1. Ticket Created Event
  events.push({
    id: `${ticket.id}-created`,
    rawDate: new Date(ticket.createdAt),
    dateStr: formatDateTime(ticket.createdAt),
    type: 'Ticket Created',
    statusVariant: 'open',
    description: ticket.description || 'Maintenance defect ticket registered.',
    technician: ticket.reportedBy ? `Reported by ${ticket.reportedBy}` : null,
  });

  // 2. Work Started Event
  const hasStartedWork =
    Boolean(ticket.startDate) ||
    ticket.status === 'IN_PROGRESS' ||
    ticket.status === 'TESTING' ||
    ticket.status === 'COMPLETED';

  if (hasStartedWork) {
    const startDate = ticket.startDate
      ? new Date(ticket.startDate)
      : new Date(createdTime + 60 * 1000); // 1 minute after creation if not explicit

    events.push({
      id: `${ticket.id}-work-started`,
      rawDate: startDate,
      dateStr: formatDateTime(startDate),
      type: 'Work Started',
      statusVariant: 'in_progress',
      description: 'Diagnostic assessment and repair procedures started by assigned technician.',
      technician: ticket.assignedTechnician,
    });
  }

  // 3. Moved to Testing Event
  const hasTesting =
    ticket.status === 'TESTING' ||
    ticket.status === 'COMPLETED' ||
    (ticket.inspectionTests && ticket.inspectionTests.length > 0);

  if (hasTesting) {
    // If inspections exist, set testing transition slightly before the earliest inspection
    let testingDate: Date;
    if (ticket.inspectionTests && ticket.inspectionTests.length > 0) {
      const earliestTestTime = Math.min(
        ...ticket.inspectionTests.map((t) => new Date(t.testDate || t.createdAt).getTime())
      );
      testingDate = new Date(earliestTestTime - 60 * 1000);
    } else {
      testingDate = new Date(ticket.updatedAt);
    }

    events.push({
      id: `${ticket.id}-moved-testing`,
      rawDate: testingDate,
      dateStr: formatDateTime(testingDate),
      type: 'Moved to Testing',
      statusVariant: 'testing',
      description: 'Physical repairs completed. Asset forwarded to quality and acceptance testing.',
      technician: ticket.assignedTechnician,
    });
  }

  // 4. Inspection Passed / Failed Events
  if (ticket.inspectionTests && ticket.inspectionTests.length > 0) {
    ticket.inspectionTests.forEach((test) => {
      const isPassed = test.passed || test.result === 'PASS' || test.status === 'PASSED';
      const testDate = new Date(test.testDate || test.createdAt);

      events.push({
        id: `${test.id}-inspection`,
        rawDate: testDate,
        dateStr: formatDateTime(testDate),
        type: isPassed ? 'Inspection Passed' : 'Inspection Failed',
        statusVariant: isPassed ? 'pass' : 'fail',
        description:
          test.findings ||
          (isPassed
            ? 'Quality test verified normal hardware/software operation under load.'
            : 'Defects remain unresolved or secondary failures detected.'),
        technician: test.testedBy ? `Inspector: ${test.testedBy}` : null,
        notes: test.recommendations,
      });
    });
  }

  // 5. Ticket Completed Event
  if (ticket.status === 'COMPLETED') {
    const completedDate = ticket.completedDate
      ? new Date(ticket.completedDate)
      : new Date(ticket.updatedAt);

    events.push({
      id: `${ticket.id}-completed`,
      rawDate: completedDate,
      dateStr: formatDateTime(completedDate),
      type: 'Ticket Completed',
      statusVariant: 'completed',
      description:
        ticket.resolutionNotes ||
        'Maintenance closed successfully. Asset restored to active custody/inventory.',
      technician: ticket.assignedTechnician,
    });
  }

  // Sort chronological: NEWEST event first
  events.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

  const getNodeIcon = (status: MaintenanceTimelineEvent['statusVariant']) => {
    switch (status) {
      case 'open':
        return (
          <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 border-2 border-white shadow-xs flex items-center justify-center shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        );
      case 'in_progress':
        return (
          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 border-2 border-white shadow-xs flex items-center justify-center shrink-0">
            <Wrench className="w-3.5 h-3.5" />
          </div>
        );
      case 'testing':
        return (
          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 border-2 border-white shadow-xs flex items-center justify-center shrink-0">
            <FlaskConical className="w-3.5 h-3.5" />
          </div>
        );
      case 'pass':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 border-2 border-white shadow-xs flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        );
      case 'fail':
        return (
          <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 border-2 border-white shadow-xs flex items-center justify-center shrink-0">
            <XCircle className="w-3.5 h-3.5" />
          </div>
        );
      case 'completed':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 border-2 border-white shadow-xs flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-eec-primary" />
          Maintenance Timeline
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          {events.length} {events.length === 1 ? 'Event' : 'Events'} Logged
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((ev) => (
          <div key={ev.id} className="relative flex items-start gap-4 group">
            {/* Node Icon */}
            <div className="absolute -left-6 mt-0.5">{getNodeIcon(ev.statusVariant)}</div>

            {/* Event Body Card */}
            <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 p-4 transition-all space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={ev.statusVariant} label={ev.type} />
                  <span className="text-xs font-bold text-slate-800">{ev.type}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{ev.dateStr}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{ev.description}</p>

              {ev.technician && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-1">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{ev.technician}</span>
                </div>
              )}

              {ev.notes && (
                <div className="flex items-start gap-1.5 text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100 mt-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed italic">{ev.notes}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
