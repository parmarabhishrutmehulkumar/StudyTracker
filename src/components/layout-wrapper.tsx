'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import QuickAdd from './quick-add';
import { Loader2, Target, Calendar } from 'lucide-react';
import { getLocalDateString } from '@/lib/utils';

interface LayoutWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function LayoutWrapper({ children, title, subtitle }: LayoutWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      const isOnboarded = (session.user as any).isOnboarded;
      if (!isOnboarded && pathname !== '/onboarding') {
        router.push('/onboarding');
      }
    }
  }, [session, status, router, pathname]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">Loading student workspace...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // redirecting
  }

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="border-b border-border bg-surface px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between sticky top-0 z-20 shadow-sm backdrop-blur bg-surface/90">
          <div>
            <h1 className="font-hanken font-bold text-2xl text-slate-800 tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-400 text-xs font-semibold mt-0.5">{subtitle}</p>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-3 md:mt-0">
            {/* Calendar display */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{todayStr}</span>
            </div>

            {/* Study goal target */}
            <div className="flex items-center space-x-2 bg-primary/5 border border-primary/10 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Target className="w-4 h-4 text-primary" />
              <span>Target: Score 95%+ ICSE</span>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto pb-24">
          {children}
        </main>
      </div>

      {/* Floating Action Button for Quick Add */}
      <QuickAdd />
    </div>
  );
}
