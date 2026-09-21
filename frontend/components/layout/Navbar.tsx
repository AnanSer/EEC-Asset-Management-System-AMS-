'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { navItems, bottomNavItems } from '@/lib/navigation';
import clsx from 'clsx';

interface NavbarProps {
  collapsed?: boolean; // reserved for Phase 2 responsive behavior
}

function getBreadcrumb(pathname: string): string[] {
  const allItems = [...navItems, ...bottomNavItems];
  const match = allItems.find(
    (item) =>
      pathname === item.href ||
      (item.href !== '/dashboard' && pathname.startsWith(item.href))
  );
  return ['Home', match?.label ?? 'Dashboard'];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Navbar(_: NavbarProps) {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
      <div className="flex items-center justify-between px-6 h-14">
        {/* ─── Breadcrumb ──────────────────────────────────────────── */}
        <nav aria-label="breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm">
            {breadcrumb.map((crumb, idx) => (
              <li key={crumb} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <span className="text-slate-300 select-none">/</span>
                )}
                <span
                  className={clsx(
                    idx === breadcrumb.length - 1
                      ? 'text-eec-primary font-semibold'
                      : 'text-slate-400'
                  )}
                >
                  {crumb}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        {/* ─── Right Controls ──────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Search Box (UI only) */}
          <div className="relative hidden sm:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={15}
            />
            <input
              type="text"
              placeholder="Search assets, employees…"
              className="pl-8 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-eec-primary transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-eec-active" />
          </button>

          {/* User Avatar */}
          <button
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-eec-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">AD</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-eec-text leading-none">Admin</p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                System Admin
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
