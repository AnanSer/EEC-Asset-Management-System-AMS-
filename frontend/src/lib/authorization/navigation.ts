/**
 * EEC EAMS – Centralized Navigation Configuration (Phase 9D.0)
 * Sidebar and navigation items mapped to RBAC allowed roles.
 */

import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  ClipboardList,
  Wrench,
  FlaskConical,
  BarChart3,
  Bell,
  Settings,
  UserCircle,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { ROLES, type Role } from './roles';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  allowedRoles: readonly Role[];
}

export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.EMPLOYEE],
  },
  {
    label: 'Departments',
    href: '/departments',
    icon: Building2,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER],
  },
  {
    label: 'Employees',
    href: '/employees',
    icon: Users,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER],
  },
  {
    label: 'Pending Approvals',
    href: '/users/pending',
    icon: UserCheck,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    label: 'Assets',
    href: '/assets',
    icon: Package,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.EMPLOYEE],
  },
  {
    label: 'Assignments',
    href: '/assignments',
    icon: ClipboardList,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN],
  },
  {
    label: 'Maintenance',
    href: '/maintenance',
    icon: Wrench,
    badge: 3,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.EMPLOYEE],
  },
  {
    label: 'Testing',
    href: '/testing',
    icon: FlaskConical,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER],
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
    badge: 5,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER],
  },
];

export const bottomNavItems: NavItem[] = [
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.EMPLOYEE],
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: UserCircle,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.EMPLOYEE],
  },
];
