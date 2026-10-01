'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { navItems, bottomNavItems, ROLES } from '@/lib/authorization';
import { usePermissions } from '@/hooks/usePermissions';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import EECLogo from '@/components/brand/EECLogo';
import clsx from 'clsx';
import { appDataCache } from '@/context/AppDataCacheContext';
import assignmentService from '@/services/assignment.service';
import maintenanceService from '@/services/maintenance.service';
import employeeService from '@/services/employee.service';
import assetService from '@/services/asset.service';
import departmentService from '@/services/department.service';
import notificationService from '@/services/notification.service';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
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

  // Prefetch top visible dashboard routes after mount/login
  useEffect(() => {
    if (!role) return;
    const allowedHrefs = visibleNavItems.slice(0, 5).map((item) => item.href);
    allowedHrefs.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {}
    });
  }, [role, router, visibleNavItems]);

  // Phase 10B.5-P2: Role-aware background idle pre-warming for primary datasets
  useEffect(() => {
    if (!role) return;

    let timeoutId: NodeJS.Timeout | null = null;
    let idleCallbackId: number | null = null;

    const performIdlePreWarm = () => {
      // Role-specific idle pre-warming based on authenticated RBAC permissions:
      if (role === ROLES.STORE_KEEPER) {
        // STORE_KEEPER: Inventory and assets pre-warming
        appDataCache.prefetch('assets:inventory', () => assetService.getInventory());
        appDataCache.prefetch('assets:list:{"page":1,"limit":10}', () =>
          assetService.getAll({ page: 1, limit: 10 })
        );
        appDataCache.prefetch('notifications:list:{"page":1,"limit":20}', () =>
          notificationService.getNotifications({ page: 1, limit: 20 })
        );
        return;
      }

      if (role === ROLES.EMPLOYEE) {
        // EMPLOYEE: Only personal resources
        appDataCache.prefetch('assets:list:{"personal":true,"limit":50}', () =>
          assetService.getAll({ personal: true, limit: 50 })
        );
        appDataCache.prefetch('maintenance:list:{"personal":true,"page":1,"limit":50}', () =>
          maintenanceService.getAll({ personal: true, page: 1, limit: 50 })
        );
        appDataCache.prefetch('notifications:list:{"page":1,"limit":20}', () =>
          notificationService.getNotifications({ page: 1, limit: 20 })
        );
        return;
      }

      // ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER:
      // 1. Department dropdown list (shared by Employees & Assets filter bars)
      appDataCache.prefetch('departments:list:{"limit":100}', () =>
        departmentService.getAll({ limit: 100 })
      );

      // 2. Employees primary list (ADMIN and DEPARTMENT_MANAGER only)
      if (role === ROLES.ADMIN || role === ROLES.DEPARTMENT_MANAGER) {
        appDataCache.prefetch('employees:list:{"status":"all","page":1,"limit":8}', () =>
          employeeService.getAll({ status: 'all', page: 1, limit: 8 })
        );
      }

      // 3. Assets primary list (ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER)
      appDataCache.prefetch('assets:list:{"page":1,"limit":10}', () =>
        assetService.getAll({ page: 1, limit: 10 })
      );

      // 4. Maintenance stats & primary list (ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER)
      appDataCache.prefetch('dashboard:maintenance_stats', () =>
        maintenanceService.getStats()
      );
      appDataCache.prefetch('maintenance:list:{"page":1,"limit":10}', () =>
        maintenanceService.getAll({ page: 1, limit: 10 })
      );

      // 5. Dashboard assignment stats (ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER)
      appDataCache.prefetch('dashboard:assignment_stats', () =>
        assignmentService.getStats()
      );
    };

    // Use requestIdleCallback when available, otherwise safe setTimeout fallback
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleCallbackId = (window as any).requestIdleCallback(
        () => {
          performIdlePreWarm();
        },
        { timeout: 3000 }
      );
    } else {
      timeoutId = setTimeout(() => {
        performIdlePreWarm();
      }, 1500);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (idleCallbackId !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleCallbackId);
      }
    };
  }, [role]);

  // Role-aware prefetch of route data and route bundle on hover
  const handlePrefetch = useCallback(
    (href: string) => {
      try {
        router.prefetch(href);
      } catch {}

      if (href === '/dashboard') {
        if (role === ROLES.ADMIN || role === ROLES.IT_TECHNICIAN || role === ROLES.DEPARTMENT_MANAGER) {
          appDataCache.prefetch('dashboard:assignment_stats', () => assignmentService.getStats());
          appDataCache.prefetch('dashboard:maintenance_stats', () => maintenanceService.getStats());
        }
      } else if (href === '/employees') {
        if (role === ROLES.ADMIN || role === ROLES.DEPARTMENT_MANAGER) {
          appDataCache.prefetch('departments:list:{"limit":100}', () =>
            departmentService.getAll({ limit: 100 })
          );
          appDataCache.prefetch('employees:list:{"status":"all","page":1,"limit":8}', () =>
            employeeService.getAll({ status: 'all', page: 1, limit: 8 })
          );
        }
      } else if (href === '/assets') {
        if (role === ROLES.ADMIN || role === ROLES.IT_TECHNICIAN || role === ROLES.DEPARTMENT_MANAGER || role === ROLES.STORE_KEEPER) {
          appDataCache.prefetch('departments:list:{"limit":100}', () =>
            departmentService.getAll({ limit: 100 })
          );
          appDataCache.prefetch('assets:list:{"page":1,"limit":10}', () =>
            assetService.getAll({ page: 1, limit: 10 })
          );
        }
      } else if (href === '/store/inventory') {
        if (role === ROLES.ADMIN || role === ROLES.IT_TECHNICIAN || role === ROLES.DEPARTMENT_MANAGER || role === ROLES.STORE_KEEPER) {
          appDataCache.prefetch('assets:inventory', () => assetService.getInventory());
        }
      } else if (href === '/maintenance') {
        if (role === ROLES.ADMIN || role === ROLES.IT_TECHNICIAN || role === ROLES.DEPARTMENT_MANAGER) {
          appDataCache.prefetch('dashboard:maintenance_stats', () => maintenanceService.getStats());
          appDataCache.prefetch('maintenance:stats', () => maintenanceService.getStats());
          appDataCache.prefetch('maintenance:list:{"page":1,"limit":10}', () =>
            maintenanceService.getAll({ page: 1, limit: 10 })
          );
        }
      } else if (href === '/departments') {
        if (role === ROLES.ADMIN || role === ROLES.DEPARTMENT_MANAGER) {
          appDataCache.prefetch('departments:list:{"status":"all","page":1,"limit":8}', () =>
            departmentService.getAll({ status: 'all', page: 1, limit: 8 })
          );
        }
      } else if (href === '/my-assets') {
        appDataCache.prefetch('assets:list:{"personal":true,"limit":50}', () =>
          assetService.getAll({ personal: true, limit: 50 })
        );
      } else if (href === '/my-maintenance') {
        appDataCache.prefetch('maintenance:list:{"personal":true,"page":1,"limit":50}', () =>
          maintenanceService.getAll({ personal: true, page: 1, limit: 50 })
        );
      } else if (href === '/notifications') {
        appDataCache.prefetch('notifications:list:{"page":1,"limit":20}', () =>
          notificationService.getNotifications({ page: 1, limit: 20 })
        );
      }
    },
    [router, role]
  );

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
              onMouseEnter={() => handlePrefetch(item.href)}
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
              onMouseEnter={() => handlePrefetch(item.href)}
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
