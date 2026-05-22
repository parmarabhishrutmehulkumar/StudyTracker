'use client';

import { useEffect, useState } from 'react';
import LayoutWrapper from '@/components/layout-wrapper';
import { useStore } from '@/store/useStore';
import Heatmap from '@/components/heatmap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import {
  ClipboardList,
  RotateCw,
  AlertTriangle,
  Flame,
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const COLORS = ['#1a4595', '#006d37', '#f39c12', '#ba1a1a', '#6b7280', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function DashboardPage() {
  const { stats, fetchDashboardData, isLoading } = useStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (!isMounted) return null;

  const quickStats = [
    {
      label: 'Homework Pending',
      value: stats?.homeworkPending ?? 0,
      icon: ClipboardList,
      cardBorder: 'border-primary/10',
      iconClasses: 'bg-primary/5 text-primary',
    },
    {
      label: 'Revision Due',
      value: stats?.revisionDue ?? 0,
      icon: RotateCw,
      cardBorder: 'border-warning/10',
      iconClasses: 'bg-warning/5 text-warning',
    },
    {
      label: 'Missed Tasks',
      value: stats?.missedTasks ?? 0,
      icon: AlertTriangle,
      cardBorder: 'border-critical/10',
      iconClasses: 'bg-critical/5 text-critical',
    },
    {
      label: 'Study Consistency',
      value: `${stats?.studyConsistency ?? 0}%`,
      icon: Flame,
      cardBorder: 'border-success/10',
      iconClasses: 'bg-success/5 text-success',
    },
    {
      label: 'Reliability Score',
      value: `${stats?.reliabilityScore ?? 0}/100`,
      icon: Activity,
      cardBorder: 'border-primary/20',
      iconClasses: 'bg-primary/10 text-primary-dark',
    },
  ];

  return (
    <LayoutWrapper
      title="Student Workspace"
      subtitle="Track your daily tuition reinforcement, homework backlogs, and study patterns."
    >
      {isLoading && !stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-100 border border-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-[340px] bg-slate-100 border border-slate-200 animate-pulse rounded-2xl"></div>
            <div className="h-[340px] bg-slate-100 border border-slate-200 animate-pulse rounded-2xl"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* 1. Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
            {quickStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`bg-surface border p-6 rounded-2xl shadow-sm ${stat.cardBorder}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.iconClasses}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-800 font-hanken">
                      {stat.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Weekly Study Trend */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm md:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-hanken font-bold text-base text-slate-800">Weekly Study Trend</h3>
                  <p className="text-slate-400 text-xs font-semibold">Tutor duration logged in the last 7 days</p>
                </div>
                <div className="text-xs font-bold font-mono text-primary bg-primary-container/20 px-2.5 py-1 rounded">
                  LOGGED HOURS
                </div>
              </div>

              <div className="flex-1 min-h-[220px]">
                {stats?.weeklyTrend && stats.weeklyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(26, 69, 149, 0.03)' }}
                        contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Bar dataKey="duration" fill="#1a4595" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-semibold text-slate-400">
                    No study entries logged in the last 7 days.
                  </div>
                )}
              </div>
            </div>

            {/* Subject Distribution */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="mb-6">
                <h3 className="font-hanken font-bold text-base text-slate-800">Subject Distribution</h3>
                <p className="text-slate-400 text-xs font-semibold">Proportion of tuition time spent</p>
              </div>

              <div className="flex-1 min-h-[220px] flex items-center justify-center relative">
                {stats?.subjectDistribution && stats.subjectDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.subjectDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {stats.subjectDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                        formatter={(value) => [`${value} hrs`, 'Study Time']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs font-semibold text-slate-400">No subject statistics logged yet.</div>
                )}
              </div>

              {/* Custom Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-bold text-slate-500 max-h-16 overflow-y-auto">
                {stats?.subjectDistribution?.map((entry, index) => (
                  <div key={entry.name} className="flex items-center space-x-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Heatmap contribution */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="font-hanken font-bold text-base text-slate-800">Study Consistency Heatmap</h3>
              <p className="text-slate-400 text-xs font-semibold">Visualizing daily logging, revisions, and task completions (past 6 months)</p>
            </div>
            
            <Heatmap data={stats?.heatmapData || {}} />
          </div>

          {/* 4. Activities & Reminders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Recent Activity Feed */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <h3 className="font-hanken font-bold text-base text-slate-800">Recent Activity Feed</h3>
                <Link href="/daily-entry" className="text-xs font-bold text-primary hover:underline flex items-center space-x-0.5">
                  <span>Log Activity</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="flex-1 space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((act) => {
                    const isTuition = act.type === 'tuition';
                    const isHomework = act.type === 'homework';
                    return (
                      <div key={act.id} className="flex items-start space-x-3 text-xs leading-normal">
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          isTuition ? 'bg-primary/5 text-primary' : isHomework ? 'bg-success/5 text-success' : 'bg-warning/5 text-warning'
                        }`}>
                          {isTuition ? <BookOpen className="w-3.5 h-3.5" /> : isHomework ? <CheckCircle2 className="w-3.5 h-3.5" /> : <RotateCw className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-700">{act.title}</p>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold font-mono mt-0.5 uppercase">
                            <span>{act.subject}</span>
                            <span>•</span>
                            <span>{act.date}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center text-center text-slate-400">
                    <Activity className="w-8 h-8 stroke-[1.5] mb-2 text-slate-300" />
                    <p className="text-xs font-semibold">No recent activity logged.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Reminders */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <h3 className="font-hanken font-bold text-base text-slate-800">Upcoming Reminders</h3>
                <Link href="/revision" className="text-xs font-bold text-primary hover:underline flex items-center space-x-0.5">
                  <span>View Planner</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="flex-1 space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {stats?.upcomingReminders && stats.upcomingReminders.length > 0 ? (
                  stats.upcomingReminders.map((rem) => {
                    const isRevision = rem.type === 'revision';
                    return (
                      <div key={rem.id} className="flex items-center justify-between text-xs border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${isRevision ? 'bg-warning/5 text-warning' : 'bg-primary/5 text-primary'}`}>
                            {isRevision ? <RotateCw className="w-3.5 h-3.5" /> : <ClipboardList className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-700">{rem.title}</p>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Alert date: {rem.date}</span>
                          </div>
                        </div>
                        <AlertCircle className="w-4 h-4 text-slate-400" />
                      </div>
                    );
                  })
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center text-center text-slate-400">
                    <Calendar className="w-8 h-8 stroke-[1.5] mb-2 text-slate-300" />
                    <p className="text-xs font-semibold">No upcoming revision or homework alerts.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}
