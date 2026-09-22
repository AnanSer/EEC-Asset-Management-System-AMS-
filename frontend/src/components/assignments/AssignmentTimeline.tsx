'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Clock,
  UserCheck,
  ArrowRightLeft,
  RotateCcw,
  Building2,
  Calendar,
  MessageSquare,
  History,
} from 'lucide-react';
import Link from 'next/link';
import assignmentService from '@/services/assignment.service';
import { AssetAssignment } from '@/constants/assignments';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export interface TimelineEvent {
  id: string;
  date: string;
  rawDate: Date;
  action: 'Assigned' | 'Transferred' | 'Returned';
  employeeName: string;
  departmentName: string;
  remarks?: string | null;
}

interface AssignmentTimelineProps {
  assetId: string;
  refreshTrigger?: number;
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

export default function AssignmentTimeline({
  assetId,
  refreshTrigger = 0,
}: AssignmentTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!assetId) return;
    try {
      setLoading(true);
      const res = await assignmentService.getHistory(assetId);
      if (res.success && Array.isArray(res.data)) {
        const history: AssetAssignment[] = res.data;
        const derivedEvents: TimelineEvent[] = [];

        history.forEach((item) => {
          // If returned, add the Return/Transfer-out event
          if (item.returnedDate) {
            const isTransfer = Boolean(
              item.remarks && item.remarks.toLowerCase().includes('transferred to')
            );
            derivedEvents.push({
              id: `${item.id}-return`,
              date: item.returnedDate,
              rawDate: new Date(item.returnedDate),
              action: isTransfer ? 'Transferred' : 'Returned',
              employeeName: item.employee?.fullName || 'Staff Member',
              departmentName: item.employee?.department?.name || 'Unassigned Directorate',
              remarks: item.remarks,
            });
          }

          // Assigned / Transfer-in event
          const isTransferIn = Boolean(
            item.remarks &&
              (item.remarks.toLowerCase().includes('transferred') ||
                item.remarks.toLowerCase().includes('transfer'))
          );
          derivedEvents.push({
            id: `${item.id}-assign`,
            date: item.assignedDate,
            rawDate: new Date(item.assignedDate),
            action: isTransferIn ? 'Transferred' : 'Assigned',
            employeeName: item.employee?.fullName || 'Staff Member',
            departmentName: item.employee?.department?.name || 'Unassigned Directorate',
            remarks: item.remarks,
          });
        });

        // Sort chronological: Newest event first
        derivedEvents.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
        setEvents(derivedEvents);
      }
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  const getActionBadge = (action: TimelineEvent['action']) => {
    switch (action) {
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3 h-3" />
            Assigned
          </span>
        );
      case 'Transferred':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ArrowRightLeft className="w-3 h-3" />
            Transferred
          </span>
        );
      case 'Returned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <RotateCcw className="w-3 h-3" />
            Returned
          </span>
        );
    }
  };

  const getActionNodeIcon = (action: TimelineEvent['action']) => {
    switch (action) {
      case 'Assigned':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 border-2 border-white shadow-xs flex items-center justify-center shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
        );
      case 'Transferred':
        return (
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 border-2 border-white shadow-xs flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
        );
      case 'Returned':
        return (
          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 border-2 border-white shadow-xs flex items-center justify-center shrink-0">
            <RotateCcw className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-eec-text uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-eec-accent" />
          Assignment Timeline
        </h3>
        <Link
          href={`/assignments/history/${assetId}`}
          className="text-xs text-eec-primary hover:underline font-semibold inline-flex items-center gap-1"
        >
          <History className="w-3.5 h-3.5" />
          Full History ({events.length})
        </Link>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : events.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Assignment Events Yet</p>
          <p className="text-xs text-slate-400 mt-1">
            This equipment is currently stored in available inventory and has no recorded assignment history.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {events.map((ev) => (
            <div key={ev.id} className="relative flex items-start gap-4 group">
              {/* Timeline Icon Node */}
              <div className="absolute -left-6 mt-0.5">{getActionNodeIcon(ev.action)}</div>

              {/* Event Content Card */}
              <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 p-4 transition-all space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getActionBadge(ev.action)}
                    <span className="text-sm font-bold text-slate-800">{ev.employeeName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(ev.date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{ev.departmentName}</span>
                </div>

                {ev.remarks && (
                  <div className="flex items-start gap-1.5 text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100 mt-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed italic">{ev.remarks}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
