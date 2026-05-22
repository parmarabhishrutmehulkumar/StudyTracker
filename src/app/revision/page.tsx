'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import LayoutWrapper from '@/components/layout-wrapper';
import { 
  Calendar, 
  RotateCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Bookmark,
  MessageSquare,
  Sparkles,
  BookOpen,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { getLocalDateString } from '@/lib/utils';
import { toast } from 'sonner';

export default function RevisionPage() {
  const { revisions, fetchRevisions, completeRevision, isLoading } = useStore();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed'>('today');
  const [selectedRevision, setSelectedRevision] = useState<any | null>(null);
  
  // Dialog Completion States
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = getLocalDateString();

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  const handleOpenCompletion = (rev: any) => {
    setSelectedRevision(rev);
    setConfidence('medium');
    setNotes('');
  };

  const handleCloseCompletion = () => {
    setSelectedRevision(null);
  };

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRevision) return;

    setIsSubmitting(true);
    try {
      await completeRevision(selectedRevision._id, confidence, notes);
      toast.success(`Completed revision for ${selectedRevision.topic}!`);
      handleCloseCompletion();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete revision');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group revisions
  const overdueRevisions = revisions.filter(r => !r.isCompleted && r.scheduledDate < todayStr);
  const todayRevisions = revisions.filter(r => !r.isCompleted && r.scheduledDate === todayStr);
  const upcomingRevisions = revisions.filter(r => !r.isCompleted && r.scheduledDate > todayStr);
  const completedRevisions = revisions.filter(r => r.isCompleted);

  // Sorting helper: chronological order for due, reverse chronological for completed
  const sortedOverdue = [...overdueRevisions].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  const sortedToday = [...todayRevisions].sort((a, b) => a.subject.localeCompare(b.subject));
  const sortedUpcoming = [...upcomingRevisions].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  const sortedCompleted = [...completedRevisions].sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));

  const getStageLabel = (stage: number) => {
    switch (stage) {
      case 1: return 'Stage 1 (+1d)';
      case 3: return 'Stage 2 (+3d)';
      case 7: return 'Stage 3 (+7d)';
      case 15: return 'Stage 4 (+15d)';
      default: return `Stage (${stage}d)`;
    }
  };

  const getConfidenceBadge = (conf: string) => {
    switch (conf) {
      case 'high':
        return 'bg-success/10 text-success border-success/20';
      case 'medium':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'low':
        return 'bg-critical/10 text-critical border-critical/20';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <LayoutWrapper
      title="Revision Calendar & Planner"
      subtitle="Track your custom spaced repetitions. Overcoming the forgetting curve requires revising at stages +1, +3, +7, and +15."
    >
      <div className="space-y-6">
        
        {/* Statistics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Overdue Reps</span>
              <span className="block text-2xl font-black text-critical font-hanken mt-1">{overdueRevisions.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-critical/5 text-critical flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Due Today</span>
              <span className="block text-2xl font-black text-primary font-hanken mt-1">{todayRevisions.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Upcoming Planned</span>
              <span className="block text-2xl font-black text-warning font-hanken mt-1">{upcomingRevisions.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-warning/5 text-warning flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Completed Reps</span>
              <span className="block text-2xl font-black text-success font-hanken mt-1">{completedRevisions.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success/5 text-success flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-border bg-slate-50/50">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center space-x-1.5 transition-colors ${
                activeTab === 'today'
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>Due Today</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${activeTab === 'today' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                {todayRevisions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('overdue')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center space-x-1.5 transition-colors ${
                activeTab === 'overdue'
                  ? 'border-critical text-critical bg-white'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>Overdue</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${activeTab === 'overdue' ? 'bg-critical text-white' : 'bg-slate-200 text-slate-500'}`}>
                {overdueRevisions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center space-x-1.5 transition-colors ${
                activeTab === 'upcoming'
                  ? 'border-warning text-warning bg-white'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>Upcoming</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${activeTab === 'upcoming' ? 'bg-warning text-white' : 'bg-slate-200 text-slate-500'}`}>
                {upcomingRevisions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center space-x-1.5 transition-colors ${
                activeTab === 'completed'
                  ? 'border-success text-success bg-white'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>Completed</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${activeTab === 'completed' ? 'bg-success text-white' : 'bg-slate-200 text-slate-500'}`}>
                {completedRevisions.length}
              </span>
            </button>
          </div>

          {/* List Content */}
          <div className="p-6">
            
            {/* Loading Indicator */}
            {isLoading && revisions.length === 0 ? (
              <div className="space-y-4 py-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-50 border border-slate-100 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : (
              <>
                {/* 1. Today's Revisions */}
                {activeTab === 'today' && (
                  <div className="space-y-3">
                    {sortedToday.length > 0 ? (
                      sortedToday.map((rev) => (
                        <div key={rev._id} className="border border-border rounded-xl p-5 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface shadow-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-black uppercase text-primary font-mono tracking-wider">{rev.subject}</span>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{getStageLabel(rev.intervalStage)}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-700 mt-1">{rev.topic}</h4>
                            <span className="text-[10px] text-slate-400 font-mono font-bold mt-1.5 block">Original Study: {rev.date}</span>
                          </div>

                          <button
                            onClick={() => handleOpenCompletion(rev)}
                            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mark Completed</span>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400">
                        <CheckCircle className="w-10 h-10 text-success mx-auto mb-3 stroke-[1.5]" />
                        <p className="text-xs font-bold">All done for today! Enjoy your evening.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Overdue Revisions */}
                {activeTab === 'overdue' && (
                  <div className="space-y-3">
                    {sortedOverdue.length > 0 ? (
                      sortedOverdue.map((rev) => (
                        <div key={rev._id} className="border border-critical/20 rounded-xl p-5 hover:border-critical/30 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-critical/[0.01] shadow-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-black uppercase text-critical font-mono tracking-wider">{rev.subject}</span>
                              <span className="text-[10px] font-bold text-critical bg-critical/5 px-2 py-0.5 rounded">{getStageLabel(rev.intervalStage)}</span>
                              <span className="text-[10px] font-bold text-slate-400">Missed on: {rev.scheduledDate}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-700 mt-1">{rev.topic}</h4>
                            <span className="text-[10px] text-slate-400 font-mono font-bold mt-1.5 block">Original Study: {rev.date}</span>
                          </div>

                          <button
                            onClick={() => handleOpenCompletion(rev)}
                            className="px-4 py-2 bg-critical hover:bg-critical-dark text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <span>Catch Up Now</span>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400">
                        <Sparkles className="w-10 h-10 text-primary mx-auto mb-3 stroke-[1.5]" />
                        <p className="text-xs font-bold">No overdue revisions. You are strictly on track!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Upcoming Revisions */}
                {activeTab === 'upcoming' && (
                  <div className="space-y-3">
                    {sortedUpcoming.length > 0 ? (
                      sortedUpcoming.map((rev) => (
                        <div key={rev._id} className="border border-border rounded-xl p-5 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/10 shadow-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-black uppercase text-slate-500 font-mono tracking-wider">{rev.subject}</span>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{getStageLabel(rev.intervalStage)}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-700 mt-1">{rev.topic}</h4>
                            <div className="flex items-center space-x-4 text-[10px] text-slate-400 font-mono font-bold mt-2 uppercase">
                              <span>Due date: {rev.scheduledDate}</span>
                              <span>•</span>
                              <span>Original log: {rev.date}</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-400 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Planned</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400">
                        <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
                        <p className="text-xs font-bold">No upcoming revisions scheduled. Keep logging tuition entries to trigger repetitions!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Completed Revisions */}
                {activeTab === 'completed' && (
                  <div className="space-y-3">
                    {sortedCompleted.length > 0 ? (
                      sortedCompleted.map((rev) => (
                        <div key={rev._id} className="border border-success/15 rounded-xl p-5 bg-success/[0.01] shadow-xs flex flex-col justify-between hover:border-success/30 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-black uppercase text-success font-mono tracking-wider">{rev.subject}</span>
                                <span className="text-[10px] font-bold text-success bg-success/5 px-2 py-0.5 rounded">{getStageLabel(rev.intervalStage)}</span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-700 mt-1">{rev.topic}</h4>
                            </div>
                            <div className="flex items-center space-x-2 self-start sm:self-center">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getConfidenceBadge(rev.confidenceLevel)}`}>
                                {rev.confidenceLevel} confidence
                              </span>
                            </div>
                          </div>

                          {rev.notes && (
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-slate-500 text-xs font-medium mb-3 flex items-start space-x-2">
                              <MessageSquare className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
                              <p className="leading-relaxed">{rev.notes}</p>
                            </div>
                          )}

                          <span className="text-[10px] text-slate-400 font-mono font-bold">Done date: {rev.scheduledDate} (Original: {rev.date})</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400">
                        <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
                        <p className="text-xs font-bold">No completed revisions yet. Consistency is key, start today!</p>
                      </div>
                    )}
                  </div>
                )}

              </>
            )}
          </div>
        </div>

      </div>

      {/* Revision Completion Dialog Modal */}
      {selectedRevision && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            <h3 className="font-hanken font-bold text-lg text-slate-800">Complete Revision Session</h3>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Topic: <strong className="text-slate-600 font-bold">{selectedRevision.topic}</strong> ({selectedRevision.subject})
            </p>

            <form onSubmit={handleSubmitCompletion} className="mt-5 space-y-4">
              
              {/* Confidence Levels */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assess Exam Confidence</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['low', 'medium', 'high'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setConfidence(lvl)}
                      className={`py-2 px-3 border rounded-xl text-xs font-bold capitalize transition-all ${
                        confidence === lvl
                          ? lvl === 'high'
                            ? 'bg-success-container/20 border-success text-success'
                            : lvl === 'medium'
                            ? 'bg-primary-container/20 border-primary text-primary'
                            : 'bg-critical-container/20 border-critical text-critical'
                          : 'bg-background border-border text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Revision Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Revision Summary Notes</label>
                <textarea
                  placeholder="Formulas re-derived, mock tests solved, or key doubts to ask your tutor during next class..."
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-50">
                <button
                  type="button"
                  onClick={handleCloseCompletion}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Complete Revision'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}
