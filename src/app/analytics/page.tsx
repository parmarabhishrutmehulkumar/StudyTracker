'use client';

import { useEffect, useState } from 'react';
import LayoutWrapper from '@/components/layout-wrapper';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  ClipboardList, 
  RotateCw, 
  Award, 
  Sparkles, 
  Loader2,
  BookOpen,
  PieChart as PieChartIcon
} from 'lucide-react';

const COLORS = ['#1a4595', '#27ae60', '#f39c12', '#ba1a1a', '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <LayoutWrapper title="Study Analytics" subtitle="Reviewing learning data...">
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </LayoutWrapper>
    );
  }

  const overallScores = [
    {
      label: 'Reliability Index',
      value: `${data?.reliabilityScore ?? 0}/100`,
      desc: 'Based on consistency & completion',
      icon: Activity,
      cardBorder: 'border-primary/15',
      iconClasses: 'bg-primary/5 text-primary',
    },
    {
      label: 'Study Consistency',
      value: `${data?.consistencyRate ?? 0}%`,
      desc: 'Active days in past 30 days',
      icon: TrendingUp,
      cardBorder: 'border-success/15',
      iconClasses: 'bg-success/5 text-success',
    },
    {
      label: 'Homework Rate',
      value: `${data?.homeworkCompletionRate ?? 0}%`,
      desc: 'Completed assignments',
      icon: ClipboardList,
      cardBorder: 'border-warning/15',
      iconClasses: 'bg-warning/5 text-warning',
    },
    {
      label: 'Revision Rate',
      value: `${data?.revisionCompletionRate ?? 0}%`,
      desc: 'Completed repetitions',
      icon: RotateCw,
      cardBorder: 'border-primary/20',
      iconClasses: 'bg-primary-dark/10 text-primary',
    }
  ];

  return (
    <LayoutWrapper
      title="Study Analytics & Insights"
      subtitle="Analyze your learning stats, detect subject weaknesses, and review historical tuition allocation."
    >
      <div className="space-y-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {overallScores.map((score, i) => {
            const Icon = score.icon;
            return (
              <div key={i} className={`bg-surface border p-6 rounded-2xl shadow-sm ${score.cardBorder}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{score.label}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${score.iconClasses}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-black text-slate-800 font-hanken tracking-tight">
                    {score.value}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{score.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Tuition hours allocation (Pie Chart) */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="mb-6 flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-hanken font-bold text-sm text-slate-800">Syllabus Coverage Breakdown</h3>
                <p className="text-slate-400 text-xs font-semibold">Total hours allocated per subject during tuitions</p>
              </div>
            </div>

            <div className="flex-1 min-h-[250px] flex items-center justify-center relative">
              {data?.subjectDistribution && data.subjectDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.subjectDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.subjectDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(value) => [`${value} hours`, 'Tutoring Time']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs font-semibold text-slate-400 flex flex-col items-center">
                  <BookOpen className="w-8 h-8 mb-2 stroke-[1.5]" />
                  <span>No tutoring logs added yet.</span>
                </div>
              )}
            </div>

            {/* Custom Legend */}
            {data?.subjectDistribution && data.subjectDistribution.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 text-[10px] font-bold text-slate-500 max-h-20 overflow-y-auto pt-4 border-t border-slate-50">
                {data.subjectDistribution.map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center space-x-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="truncate">{entry.name} ({entry.value}h)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revision scheduled vs completed (Bar Chart) */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="mb-6 flex items-center space-x-2">
              <RotateCw className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-hanken font-bold text-sm text-slate-800">Spaced repetition retention</h3>
                <p className="text-slate-400 text-xs font-semibold">Total scheduled vs completed revision stages by subject</p>
              </div>
            </div>

            <div className="flex-1 min-h-[250px]">
              {data?.revisionConsistencyChart && data.revisionConsistencyChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revisionConsistencyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="subject" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Bar dataKey="scheduled" name="Scheduled Revisions" fill="#1a4595" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="completed" name="Completed Revisions" fill="#27ae60" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-xs font-semibold text-slate-400">
                  <RotateCw className="w-8 h-8 mb-2 stroke-[1.5]" />
                  <span>No revision statistics available.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Smart Recommendations Panel */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4.5 border-b border-border pb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-hanken font-bold text-sm text-slate-800">Smart Remediation Insights</h3>
              <p className="text-slate-400 text-xs font-semibold">Automatic triggers checking confidence levels and log consistency</p>
            </div>
          </div>

          <div className="space-y-4">
            {data?.insights && data.insights.length > 0 ? (
              data.insights.map((insight: string, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-start space-x-3.5 text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50 border border-slate-100 rounded-xl p-4"
                  dangerouslySetInnerHTML={{ __html: insight }}
                />
              ))
            ) : (
              <div className="flex items-center justify-center py-6 text-xs text-slate-400 font-bold">
                <Award className="w-6 h-6 mr-2 text-primary" />
                <span>All parameters look stable. Keep logging entries!</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </LayoutWrapper>
  );
}
