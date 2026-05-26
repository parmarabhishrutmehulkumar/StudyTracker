'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  PlusSquare,
  ClipboardList,
  CalendarDays,
  LineChart,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  LogOut,
  User,
  GraduationCap,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Daily Entry', href: '/daily-entry', icon: PlusSquare },
  { label: 'Homework Tracker', href: '/homework', icon: ClipboardList },
  { label: 'Revision Planner', href: '/revision', icon: CalendarDays },
  { label: 'Analytics Insights', href: '/analytics', icon: LineChart },
  { label: 'Missed Tasks', href: '/missed', icon: AlertTriangle },
  { label: 'Academic Reports', href: '/reports', icon: FileSpreadsheet },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isCollapsed = false, isMobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-30 bg-slate-900/40 transition-opacity duration-300 md:hidden',
          isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
      />
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen flex flex-col bg-surface border-r border-border shadow-xl transition-all duration-300 transform md:static md:translate-x-0 md:shadow-none',
          isCollapsed ? 'w-20' : 'w-[280px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        {/* Brand Logo */}
        <div className="flex items-center justify-between gap-3 p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-hanken font-bold text-lg text-primary tracking-tight block">StudyPulse</span>
                <span className="block text-[10px] font-mono tracking-widest text-primary-dark uppercase font-bold leading-none">ICSE Class 10</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-slate-600 hover:bg-slate-50 md:hidden"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-150 text-slate-600 hover:text-primary hover:bg-slate-50',
                  isCollapsed && 'justify-center px-2',
                  isActive && 'bg-primary/5 text-primary border-l-3 border-primary rounded-l-none pl-3 sidebar-active'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-primary' : 'text-slate-400')} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Session Footer */}
        <div className={cn('p-4 border-t border-border bg-slate-50/50', isCollapsed && 'px-3')}>
          <div className={cn('flex items-center gap-3 mb-4', isCollapsed && 'justify-center')}>
            <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{session?.user?.name || 'Student'}</p>
                <p className="text-[10px] font-medium text-slate-400 truncate">{session?.user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-500 hover:text-critical hover:bg-critical/5 transition-all duration-150',
              isCollapsed && 'justify-center'
            )}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
