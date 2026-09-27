/**
 * Notification Utilities — EEC EAMS (Phase 10B.3)
 * Provides enterprise relative time formatting, timezone support, and date grouping.
 */

export type NotificationGroupKey = 'today' | 'yesterday' | 'earlierThisWeek' | 'older';

export interface NotificationGroup<T> {
  key: NotificationGroupKey;
  label: string;
  items: T[];
}

/**
 * Calculates calendar day difference in a specified timezone.
 * Returns 0 for same day (Today), 1 for Yesterday, etc.
 */
export function getDaysDifference(
  targetDate: Date,
  nowDate: Date = new Date(),
  timeZone: string = 'Africa/Addis_Ababa'
): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const targetYMD = formatter.format(targetDate);
    const nowYMD = formatter.format(nowDate);

    const [tYear, tMonth, tDay] = targetYMD.split('-').map(Number);
    const [nYear, nMonth, nDay] = nowYMD.split('-').map(Number);

    const targetUtcMidnight = Date.UTC(tYear, tMonth - 1, tDay);
    const nowUtcMidnight = Date.UTC(nYear, nMonth - 1, nDay);

    return Math.round((nowUtcMidnight - targetUtcMidnight) / (1000 * 60 * 60 * 24));
  } catch {
    // Fallback in case of timezone parsing error
    const diffMs = nowDate.getTime() - targetDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}

/**
 * Enterprise Relative Time Formatter.
 *
 * Examples:
 * - Just now
 * - 5 minutes ago
 * - 2 hours ago
 * - Yesterday · 4:35 PM
 * - Tuesday · 9:15 AM
 * - 18 Sep 2026 · 10:30 AM
 */
export function formatEnterpriseRelativeTime(
  dateInput: string | Date,
  timeZone: string = 'Africa/Addis_Ababa',
  nowDate: Date = new Date()
): string {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) {
      return typeof dateInput === 'string' ? dateInput : '';
    }

    const diffMs = nowDate.getTime() - date.getTime();
    const diffDays = getDaysDifference(date, nowDate, timeZone);

    // Less than 1 minute (or negative due to minor clock skew)
    if (diffMs < 60 * 1000) {
      return 'Just now';
    }

    // Less than 1 hour
    if (diffMs < 60 * 60 * 1000) {
      const minutes = Math.floor(diffMs / (60 * 1000));
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Today (< 24h & same calendar day)
    if (diffDays === 0) {
      const hours = Math.floor(diffMs / (60 * 60 * 1000));
      if (hours < 1) return 'Just now';
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Time formatter (e.g. "4:35 PM")
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const timeString = timeFormatter.format(date);

    // Yesterday
    if (diffDays === 1) {
      return `Yesterday · ${timeString}`;
    }

    // Earlier this week (2 to 6 days ago)
    if (diffDays >= 2 && diffDays < 7) {
      const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'long',
      });
      return `${weekdayFormatter.format(date)} · ${timeString}`;
    }

    // Older (7+ days ago) — format e.g. "18 Sep 2026 · 10:30 AM"
    const day = date.toLocaleDateString('en-US', { timeZone, day: 'numeric' });
    const month = date.toLocaleDateString('en-US', { timeZone, month: 'short' });
    const year = date.toLocaleDateString('en-US', { timeZone, year: 'numeric' });

    return `${day} ${month} ${year} · ${timeString}`;
  } catch {
    return typeof dateInput === 'string' ? dateInput : '';
  }
}

/**
 * Group notifications into:
 * - Today
 * - Yesterday
 * - Earlier This Week
 * - Older
 * Preserves original sort order (newest first) within each group.
 */
export function groupNotifications<T extends { createdAt: string | Date }>(
  items: T[],
  timeZone: string = 'Africa/Addis_Ababa',
  nowDate: Date = new Date()
): NotificationGroup<T>[] {
  const groups: Record<NotificationGroupKey, T[]> = {
    today: [],
    yesterday: [],
    earlierThisWeek: [],
    older: [],
  };

  for (const item of items) {
    const date = typeof item.createdAt === 'string' ? new Date(item.createdAt) : item.createdAt;
    const diffDays = getDaysDifference(date, nowDate, timeZone);

    if (diffDays === 0) {
      groups.today.push(item);
    } else if (diffDays === 1) {
      groups.yesterday.push(item);
    } else if (diffDays >= 2 && diffDays < 7) {
      groups.earlierThisWeek.push(item);
    } else {
      groups.older.push(item);
    }
  }

  const result: NotificationGroup<T>[] = [];

  if (groups.today.length > 0) {
    result.push({ key: 'today', label: 'Today', items: groups.today });
  }
  if (groups.yesterday.length > 0) {
    result.push({ key: 'yesterday', label: 'Yesterday', items: groups.yesterday });
  }
  if (groups.earlierThisWeek.length > 0) {
    result.push({ key: 'earlierThisWeek', label: 'Earlier This Week', items: groups.earlierThisWeek });
  }
  if (groups.older.length > 0) {
    result.push({ key: 'older', label: 'Older', items: groups.older });
  }

  return result;
}
