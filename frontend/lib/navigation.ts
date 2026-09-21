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
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Departments', href: '/departments', icon: Building2 },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Assets', href: '/assets', icon: Package },
  { label: 'Assignments', href: '/assignments', icon: ClipboardList },
  { label: 'Maintenance', href: '/maintenance', icon: Wrench, badge: 3 },
  { label: 'Testing', href: '/testing', icon: FlaskConical },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Notifications', href: '/notifications', icon: Bell, badge: 5 },
];

export const bottomNavItems: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Profile', href: '/profile', icon: UserCircle },
];
