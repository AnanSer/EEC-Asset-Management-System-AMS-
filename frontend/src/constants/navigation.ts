/**
 * Navigation route constants for EEC EAMS.
 * Keeps route strings in one place to avoid magic strings across the app.
 * The full nav config with icons lives in lib/navigation.ts.
 */

export const ROUTES = {
  dashboard:     '/dashboard',
  departments:   '/departments',
  employees:     '/employees',
  assets:        '/assets',
  assignments:   '/assignments',
  maintenance:   '/maintenance',
  testing:       '/testing',
  reports:       '/reports',
  notifications: '/notifications',
  settings:      '/settings',
  profile:       '/profile',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
