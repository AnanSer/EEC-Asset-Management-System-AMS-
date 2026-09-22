import clsx from 'clsx';

type StatusVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'assigned'
  | 'maintenance'
  | 'testing'
  | 'retired'
  | 'available'
  | 'disposed'
  | 'excellent'
  | 'good'
  | 'fair'
  | 'needs_repair'
  | 'damaged'
  | 'ACTIVE'
  | 'INACTIVE'
  | string;

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
}

const baseVariantMap: Record<string, { classes: string; dot: string; defaultLabel: string }> = {
  // Operational status
  active:      { classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200',   dot: 'bg-emerald-500', defaultLabel: 'Active'      },
  approved:    { classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200',   dot: 'bg-emerald-500', defaultLabel: 'Approved'    },
  inactive:    { classes: 'bg-slate-100  text-slate-600   ring-slate-200',     dot: 'bg-slate-400',   defaultLabel: 'Inactive'    },
  pending:     { classes: 'bg-amber-50   text-amber-700   ring-amber-200',     dot: 'bg-amber-500',   defaultLabel: 'Pending'     },
  rejected:    { classes: 'bg-rose-50    text-rose-700    ring-rose-200',      dot: 'bg-rose-500',    defaultLabel: 'Rejected'    },
  suspended:   { classes: 'bg-red-50     text-red-700     ring-red-200',       dot: 'bg-red-500',     defaultLabel: 'Suspended'   },
  // Asset status
  available:   { classes: 'bg-teal-50    text-teal-700    ring-teal-200',      dot: 'bg-teal-500',    defaultLabel: 'Available'   },
  assigned:    { classes: 'bg-blue-50    text-blue-700    ring-blue-200',      dot: 'bg-blue-500',    defaultLabel: 'Assigned'    },
  maintenance: { classes: 'bg-orange-50  text-orange-700  ring-orange-200',    dot: 'bg-orange-500',  defaultLabel: 'Maintenance' },
  testing:     { classes: 'bg-purple-50  text-purple-700  ring-purple-200',    dot: 'bg-purple-500',  defaultLabel: 'Testing'     },
  retired:     { classes: 'bg-red-50     text-red-700     ring-red-200',       dot: 'bg-red-500',     defaultLabel: 'Retired'     },
  disposed:    { classes: 'bg-slate-100  text-slate-500   ring-slate-200',     dot: 'bg-slate-400',   defaultLabel: 'Disposed'    },
  // Asset condition
  excellent:   { classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200',   dot: 'bg-emerald-500', defaultLabel: 'Excellent'   },
  good:        { classes: 'bg-teal-50    text-teal-700    ring-teal-200',      dot: 'bg-teal-500',    defaultLabel: 'Good'        },
  fair:        { classes: 'bg-amber-50   text-amber-700   ring-amber-200',     dot: 'bg-amber-500',   defaultLabel: 'Fair'        },
  needs_repair:{ classes: 'bg-orange-50  text-orange-700  ring-orange-200',    dot: 'bg-orange-500',  defaultLabel: 'Needs Repair'},
  damaged:     { classes: 'bg-rose-50    text-rose-700    ring-rose-200',      dot: 'bg-rose-500',    defaultLabel: 'Damaged'     },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const key = (status || '').toLowerCase();
  const config = baseVariantMap[key] ?? baseVariantMap.active;
  const { classes, dot, defaultLabel } = config;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset',
        classes
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />
      {label ?? defaultLabel}
    </span>
  );
}
