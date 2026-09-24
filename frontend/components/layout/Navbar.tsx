'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, User, ShieldCheck } from 'lucide-react';
import { navItems, bottomNavItems } from '@/lib/navigation';
import { authClient } from '@/lib/auth-client';
import clsx from 'clsx';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import NavbarSearch from './NavbarSearch';
import { UserAvatar } from '@/components/auth';

interface NavbarProps {
  collapsed?: boolean;
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
  const router = useRouter();
  const breadcrumb = getBreadcrumb(pathname);
  const { branding, isLoading } = useSystemSettings();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Staff User');
  const [userRole, setUserRole] = useState('Employee');
  const [userEmail, setUserEmail] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Load active user info from /api/auth/me
  useEffect(() => {
    async function loadUser() {
      try {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
        const res = await fetch(`${apiBase}/api/auth/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          const user = json?.data?.user;
          const businessUser = json?.data?.businessUser;
          if (user) {
            setUserName(user.name || businessUser?.employeeProfile?.fullName || 'Staff User');
            setUserEmail(user.email || '');
            if (businessUser?.role) {
              setUserRole(businessUser.role.replace('_', ' '));
            }
          }
        }
      } catch (err) {
        console.error('Navbar user fetch error:', err);
      }
    }

    loadUser();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push('/login');
    } catch (err) {
      console.error('Sign out error:', err);
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Left Section: Organization Branding & Breadcrumb */}
        <div className="flex items-center gap-3.5 min-w-0">
          {isLoading ? (
            <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-slate-200 animate-pulse" />
              <div className="w-14 h-4 bg-slate-200 rounded animate-pulse hidden sm:block" />
            </div>
          ) : (
            <div
              className="flex items-center gap-2 pr-3 border-r border-slate-200 cursor-default select-none"
              title={branding.organizationName}
            >
              {branding.logoUrl ? (
                <div className="flex items-center gap-2">
                  <div className="h-7 px-1.5 py-0.5 rounded-lg bg-[#083D4A] flex items-center justify-center shadow-2xs">
                    <img
                      src={branding.logoUrl}
                      alt={branding.organizationName}
                      className="h-5 w-auto max-w-[120px] object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-800 tracking-tight hidden sm:inline">
                    {branding.organizationShortName}
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#083D4A] to-[#00A7D6] text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">
                    {branding.organizationShortName ? branding.organizationShortName.slice(0, 3) : 'EEC'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 tracking-tight hidden sm:inline">
                    {branding.organizationShortName}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Breadcrumb */}
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
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Global Search */}
          <NavbarSearch />

          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-eec-primary transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-eec-active" />
          </button>

          {/* User Profile & Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              <UserAvatar name={userName} email={userEmail} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-eec-text leading-none max-w-[120px] truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5 capitalize">
                  {userRole.toLowerCase()}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                <div className="px-3.5 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">
                    {userName}
                  </p>
                  {userEmail && (
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {userEmail}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-eec-primary/10 text-eec-primary uppercase tracking-wider">
                    <ShieldCheck size={11} /> {userRole}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push('/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <User size={15} className="text-slate-400" />
                    <span>My Profile</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut size={15} className="text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
