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
  Settings,
  UserCircle,
  UserCheck,
  Laptop,
  Warehouse,
  ClipboardCheck,
  PackageCheck,
  SendHorizontal,
  RotateCcw,
  Store,
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
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.EMPLOYEE, ROLES.STORE_KEEPER],
  },
  {
    label: 'Departments',
    href: '/departments',
    icon: Building2,
    allowedRoles: [ROLES.ADMIN, ROLES.DEPARTMENT_MANAGER],
  },
  {
    label: 'Employees',
    href: '/employees',
    icon: Users,
    allowedRoles: [ROLES.ADMIN, ROLES.DEPARTMENT_MANAGER],
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
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.STORE_KEEPER],
  },
  {
    label: 'Store Operations',
    href: '/store',
    icon: Store,
    allowedRoles: [ROLES.STORE_KEEPER, ROLES.ADMIN],
  },
  {
    label: 'Inventory',
    href: '/store/inventory',
    icon: Warehouse,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.STORE_KEEPER],
  },
  {
    label: 'Store Requests',
    href: '/store/requests',
    icon: PackageCheck,
    allowedRoles: [ROLES.STORE_KEEPER, ROLES.ADMIN],
  },
  {
    label: 'Returns',
    href: '/store/returns',
    icon: RotateCcw,
    allowedRoles: [ROLES.STORE_KEEPER, ROLES.ADMIN],
  },
  {
    label: 'Asset Requests',
    href: '/requests',
    icon: ClipboardCheck,
    allowedRoles: [ROLES.ADMIN, ROLES.DEPARTMENT_MANAGER],
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
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER],
  },
  {
    label: 'Testing',
    href: '/testing',
    icon: FlaskConical,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN],
  },
  {
    label: 'My Requests',
    href: '/my-requests',
    icon: SendHorizontal,
    allowedRoles: [ROLES.EMPLOYEE, ROLES.DEPARTMENT_MANAGER, ROLES.IT_TECHNICIAN, ROLES.STORE_KEEPER],
  },
  {
    label: 'My Assets',
    href: '/my-assets',
    icon: Laptop,
    allowedRoles: [ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.EMPLOYEE, ROLES.STORE_KEEPER],
  },
  {
    label: 'My Maintenance',
    href: '/my-maintenance',
    icon: Wrench,
    allowedRoles: [ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.EMPLOYEE, ROLES.STORE_KEEPER],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    allowedRoles: [ROLES.ADMIN, ROLES.DEPARTMENT_MANAGER],
  },
];

export const bottomNavItems: NavItem[] = [
  {
    label: 'Profile',
    href: '/profile',
    icon: UserCircle,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.EMPLOYEE, ROLES.STORE_KEEPER],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    allowedRoles: [ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.EMPLOYEE, ROLES.STORE_KEEPER],
  },
];
