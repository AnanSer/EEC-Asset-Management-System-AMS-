'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { navItems, bottomNavItems } from '@/lib/authorization';
import { usePermissions } from '@/hooks/usePermissions';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import EECLogo from '@/components/brand/EECLogo';
import clsx from 'clsx';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { role } = usePermissions();
  const { branding, isLoading } = useSystemSettings();

  const visibleNavItems = navItems.filter((item) => {
    if (!role) return true;
    return item.allowedRoles.includes(role);
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
        {isLoading ? (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-white/10" />
            {!collapsed && (
              <div className="space-y-1.5">
                <div className="w-24 h-3.5 bg-white/10 rounded" />
                <div className="w-12 h-2.5 bg-white/10 rounded" />
              </div>
            )}
          </div>
        ) : (
          <>
            {collapsed ? (
              <img
                src="/branding/logo-mark.png"
                alt={branding.organizationShortName}
                className="w-8 h-8 rounded-lg object-contain bg-white/10 border border-white/15 p-1 flex-shrink-0"
              />
            ) : (
              <div className="flex flex-col gap-1 overflow-hidden">
                <img
                  src={branding.logoUrl || '/branding/eec-logo.png'}
                  alt={branding.organizationName}
                  className="h-9 w-auto max-w-[185px] object-contain"
                />
                <p className="text-eec-accent text-[10px] font-bold tracking-widest uppercase pl-0.5">
                  {branding.organizationShortName} Asset Management
                </p>
              </div>
            )}
          </>
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

      {/* ─── Footer Branding ─────────────────────────────────────────── */}
      <div className="border-t border-white/10 p-3 mt-auto bg-black/10">
        {isLoading ? (
          <div className="space-y-1.5 animate-pulse">
            <div className={clsx('h-3 bg-white/10 rounded', collapsed ? 'w-6 mx-auto' : 'w-24')} />
            {!collapsed && <div className="h-2.5 bg-white/10 rounded w-36" />}
          </div>
        ) : collapsed ? (
          <div
            className="flex flex-col items-center justify-center text-white/60 hover:text-white transition-colors cursor-default"
            title={`${branding.organizationShortName} • ${branding.systemVersion} • ${branding.timezone}`}
          >
            <span className="text-[10px] font-bold text-eec-accent tracking-tighter">
              {branding.organizationShortName.slice(0, 3)}
            </span>
            <span className="text-[8px] text-white/40 font-mono">
              {branding.systemVersion}
            </span>
          </div>
        ) : (
          <div className="space-y-1 text-white/50 text-[11px] leading-tight select-none">
            <div className="flex items-center justify-between text-white/80 font-semibold">
              <span className="truncate pr-1" title={branding.organizationName}>
                {branding.organizationShortName}
              </span>
              <span className="text-[10px] font-mono text-eec-accent shrink-0 px-1 py-0.2 rounded bg-white/5 border border-white/10">
                {branding.systemVersion}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/40 truncate" title={branding.timezone}>
              <Globe size={11} className="shrink-0 text-white/30" />
              <span className="truncate">{branding.timezone}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
