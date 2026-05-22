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

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <aside className="w-[280px] bg-surface border-r border-border h-screen flex flex-col sticky top-0 z-30 flex-shrink-0">
      {/* Brand Logo */}
      <div className="p-6 border-b border-border flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <span className="font-hanken font-bold text-lg text-primary tracking-tight block">StudyPulse</span>
          <span className="block text-[10px] font-mono tracking-widest text-primary-dark uppercase font-bold leading-none">ICSE Class 10</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 text-slate-600 hover:text-primary hover:bg-slate-50",
                isActive && "bg-primary/5 text-primary border-l-3 border-primary rounded-l-none pl-3 sidebar-active"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-border bg-slate-50/50">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{session?.user?.name || 'Student'}</p>
            <p className="text-[10px] font-medium text-slate-400 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-critical hover:bg-critical/5 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
