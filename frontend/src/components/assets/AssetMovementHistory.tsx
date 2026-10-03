'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  UserCheck,
  ArrowRightLeft,
  RotateCcw,
  Building2,
  Calendar,
  MessageSquare,
  Wrench,
  FlaskConical,
  MapPin,
  CheckCircle2,
  Sparkles,
  History,
  Tag,
} from 'lucide-react';
import storeService from '@/services/store.service';
import { AssetMovementEvent, MovementEventType } from '@/constants/store';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

interface AssetMovementHistoryProps {
  assetId: string;
  refreshTrigger?: number;
}

export default function AssetMovementHistory({
  assetId,
  refreshTrigger = 0,
}: AssetMovementHistoryProps) {
  const [events, setEvents] = useState<AssetMovementEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovementHistory = useCallback(async () => {
    if (!assetId) return;
    try {
      setLoading(true);
      const res = await storeService.getAssetMovementHistory(assetId);
      if (res.success && res.data) {
        setEvents(res.data.events || []);
      }
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    fetchMovementHistory();
  }, [fetchMovementHistory, refreshTrigger]);

  const getEventBadge = (type: MovementEventType) => {
    switch (type) {
      case 'ASSIGNMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3 h-3" />
            Assigned
          </span>
        );
      case 'TRANSFER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ArrowRightLeft className="w-3 h-3" />
            Transferred
          </span>
        );
      case 'RETURN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <RotateCcw className="w-3 h-3" />
            Returned
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <Wrench className="w-3 h-3" />
            Maintenance
          </span>
        );
      case 'TESTING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <FlaskConical className="w-3 h-3" />
            Testing
          </span>
        );
      case 'LOCATION_CHANGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <MapPin className="w-3 h-3" />
            Location
          </span>
        );
    }
  };

  const getEventNodeIcon = (type: MovementEventType) => {
    switch (type) {
      case 'ASSIGNMENT':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 border-2 border-white shadow-2xs flex items-center justify-center shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
        );
      case 'TRANSFER':
        return (
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 border-2 border-white shadow-2xs flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
        );
      case 'RETURN':
        return (
          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 border-2 border-white shadow-2xs flex items-center justify-center shrink-0">
            <RotateCcw className="w-3.5 h-3.5" />
          </div>
        );
      case 'MAINTENANCE':
        return (
          <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 border-2 border-white shadow-2xs flex items-center justify-center shrink-0">
            <Wrench className="w-3.5 h-3.5" />
          </div>
        );
      case 'TESTING':
        return (
          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 border-2 border-white shadow-2xs flex items-center justify-center shrink-0">
            <FlaskConical className="w-3.5 h-3.5" />
          </div>
        );
      case 'LOCATION_CHANGE':
        return (
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 border-2 border-white shadow-2xs flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  // Build the simple chronological path summary: Assigned → Transferred → Returned → ...
  const summaryFlow = React.useMemo(() => {
    if (events.length === 0) return [];
    // Oldest to newest for the sequence summary
    const chronological = [...events].reverse();
    return chronological.map((e) => {
      switch (e.type) {
        case 'ASSIGNMENT':
          return 'Assigned';
        case 'TRANSFER':
          return 'Transferred';
        case 'RETURN':
          return 'Returned';
        case 'MAINTENANCE':
          return 'Maintenance';
        case 'TESTING':
          return 'Testing';
        case 'LOCATION_CHANGE':
          return 'Registered';
        default:
          return e.title;
      }
    });
  }, [events]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-eec-text uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-eec-accent" />
            Asset Movement &amp; Custody History
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete physical lifecycle: custody assignments, transfers, returns, and storage locations.
          </p>
        </div>

        {events.length > 0 && (
          <span className="text-xs text-slate-500 font-medium">
            {events.length} movement event{events.length === 1 ? '' : 's'} recorded
          </span>
        )}
      </div>

      {/* Movement Journey Flow Badge Strip: Assigned → Transferred → Returned → ... */}
      {summaryFlow.length > 0 && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 overflow-x-auto text-xs font-semibold text-slate-700">
          <span className="text-2xs text-slate-400 uppercase tracking-wider shrink-0 font-bold">
            Journey Flow:
          </span>
          {summaryFlow.map((step, idx) => (
            <React.Fragment key={idx}>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs shrink-0 text-slate-800">
                {step}
              </span>
              {idx < summaryFlow.length - 1 && (
                <span className="text-slate-400 shrink-0 font-bold">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {loading ? (
        <CardSkeleton />
      ) : events.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Movement Events Recorded</p>
          <p className="text-xs text-slate-400 mt-1">
            This equipment is currently stored in available inventory and has no recorded assignment history.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {events.map((ev) => (
            <div key={ev.id} className="relative flex items-start gap-4 group">
              {/* Timeline Icon Node */}
              <div className="absolute -left-6 mt-0.5">{getEventNodeIcon(ev.type)}</div>

              {/* Event Content Card */}
              <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 p-4 transition-all space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getEventBadge(ev.type)}
                    <span className="text-sm font-bold text-slate-800">{ev.title}</span>
                    {ev.condition && (
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        Condition: {ev.condition}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(ev.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Metadata Details */}
                <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                  {ev.employeeName && (
                    <span className="font-medium text-slate-800">
                      Holder: {ev.employeeName}
                    </span>
                  )}
                  {ev.departmentName && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {ev.departmentName}
                      </span>
                    </>
                  )}
                  {ev.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {ev.location}
                      </span>
                    </>
                  )}
                </div>

                {/* Person who approved/confirmed receipt or handled movement */}
                {ev.actorName && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div className={`p-1 rounded shrink-0 ${
                      ev.type === 'RETURN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-700">
                        {ev.type === 'RETURN'
                          ? 'Receipt Confirmed & Approved By:'
                          : ev.type === 'ASSIGNMENT' || ev.type === 'TRANSFER'
                          ? 'Handled / Handed Over By:'
                          : 'Action Performed By:'}
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded border text-xs ${
                        ev.type === 'RETURN'
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                          : 'text-blue-800 bg-blue-50 border-blue-200'
                      }`}>
                        {ev.actorName}
                      </span>
                      {ev.actorEmail && (
                        <span className="text-2xs text-slate-400 font-mono">
                          ({ev.actorEmail})
                        </span>
                      )}
                      {ev.actorRole && (
                        <span className="text-2xs text-slate-500 font-medium capitalize">
                          • {ev.actorRole.replace('_', ' ').toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes & Details */}
                {ev.details && (
                  <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 mt-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed italic">{ev.details}</span>
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
