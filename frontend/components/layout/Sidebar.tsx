'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { navItems, bottomNavItems } from '@/lib/authorization';
import { usePermissions } from '@/hooks/usePermissions';
import EECLogo from '@/components/brand/EECLogo';
import clsx from 'clsx';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { role } = usePermissions();

  const visibleNavItems = navItems
    .filter((item) => {
      if (!role) return true;
      return item.allowedRoles.includes(role);
    })
    .map((item) => {
      if (role === 'EMPLOYEE') {
        if (item.href === '/assets') return { ...item, label: 'My Assets' };
        if (item.href === '/maintenance') return { ...item, label: 'My Maintenance' };
      }
      return item;
    });

  const visibleBottomNavItems = bottomNavItems.filter((item) => {
    if (!role) return true;
    return item.allowedRoles.includes(role);
  });

  return (
    <aside
      className={clsx(
        'relative flex flex-col h-full bg-eec-primary shadow-sidebar sidebar-transition z-30 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* ─── Logo / Brand ─────────────────────────────────────────────── */}
      <div
        className={clsx(
          'flex items-center gap-3 px-4 py-5 border-b border-white/10',
          collapsed && 'justify-center px-2'
        )}
      >
        <EECLogo size={collapsed ? 32 : 36} />
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight truncate">
              Ethiopian Engineering
            </p>
            <p className="text-eec-accent text-xs font-semibold tracking-widest">
              EAMS
            </p>
          </div>
        )}
      </div>

      {/* ─── Toggle Button ────────────────────────────────────────────── */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 z-40 flex items-center justify-center w-6 h-6 rounded-full bg-eec-accent text-white shadow-md hover:bg-eec-accent/80 transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* ─── Main Navigation ─────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {!collapsed && (
          <p className="px-3 pb-2 text-white/40 text-[10px] font-semibold tracking-widest uppercase">
            Main Menu
          </p>
        )}
        {visibleNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 relative',
                collapsed ? 'justify-center px-2' : '',
                isActive
                  ? 'nav-item-active'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={clsx(
                  'flex-shrink-0 w-4.5 h-4.5 transition-colors',
                  isActive ? 'text-eec-accent' : 'text-white/60 group-hover:text-white'
                )}
                size={18}
              />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!collapsed && item.badge !== undefined && (
                <span className="ml-auto flex-shrink-0 bg-eec-active text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge !== undefined && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-eec-active" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ─── Bottom Navigation ───────────────────────────────────────── */}
      <div className="border-t border-white/10 py-3 px-2 space-y-0.5">
        {visibleBottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150',
                collapsed ? 'justify-center px-2' : '',
                isActive
                  ? 'nav-item-active'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={clsx(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-eec-accent' : 'text-white/60 group-hover:text-white'
                )}
                size={18}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
