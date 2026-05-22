'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useSession } from 'next-auth/react';
import LayoutWrapper from '@/components/layout-wrapper';
import { BookOpen, ClipboardList, RotateCw, Loader2, CheckCircle2, Circle, AlertCircle, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { getLocalDateString } from '@/lib/utils';

export default function DailyEntryPage() {
  const { data: session } = useSession();
  const { 
    recurringTasks, 
    fetchRecurringTasks, 
    toggleRecurringTask, 
    addTuitionEntry, 
    addHomeworkTask,
    isLoading 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'tuition' | 'homework' | 'revision'>('tuition');
  const [isSaving, setIsSaving] = useState(false);

  // Tuition Form States
  const [tuitionSubject, setTuitionSubject] = useState('');
  const [tuitionTopic, setTuitionTopic] = useState('');
  const [tuitionDuration, setTuitionDuration] = useState(60);
  const [tuitionConcepts, setTuitionConcepts] = useState('');
  const [tutorNotes, setTutorNotes] = useState('');

  // Homework Form States
  const [hwSubject, setHwSubject] = useState('');
  const [hwTitle, setHwTitle] = useState('');
  const [hwDueDate, setHwDueDate] = useState('');
  const [hwPriority, setHwPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [hwNotes, setHwNotes] = useState('');

  // Revision Form States
  const [revSubject, setRevSubject] = useState('');
  const [revTopic, setRevTopic] = useState('');
  const [revNotes, setRevNotes] = useState('');
  const [revConfidence, setRevConfidence] = useState<'low' | 'medium' | 'high'>('medium');

  const todayStr = getLocalDateString();

  const subjects = (session?.user as any)?.subjects || [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'
  ];

  useEffect(() => {
    fetchRecurringTasks(todayStr);
  }, [fetchRecurringTasks, todayStr]);

  const handleLogTuition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tuitionSubject) {
      toast.error('Please select a subject');
      return;
    }
    if (!tuitionTopic) {
      toast.error('Please enter the topic studied');
      return;
    }

    setIsSaving(true);
    try {
      await addTuitionEntry({
        date: todayStr,
        subject: tuitionSubject,
        topic: tuitionTopic,
        conceptsTaught: tuitionConcepts,
        tutorNotes: tutorNotes || undefined,
        duration: tuitionDuration,
      });
      
      toast.success('Tuition entry logged! 4 spaced repetitions have been scheduled.');
      
      // Reset fields
      setTuitionTopic('');
      setTuitionConcepts('');
      setTutorNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save tuition entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwSubject) {
      toast.error('Please select a subject');
      return;
    }
    if (!hwTitle) {
      toast.error('Please specify the homework description');
      return;
    }
    if (!hwDueDate) {
      toast.error('Please select a due date');
      return;
    }

    setIsSaving(true);
    try {
      await addHomeworkTask({
        date: todayStr,
        subject: hwSubject,
        title: hwTitle,
        dueDate: hwDueDate,
        priority: hwPriority,
        notes: hwNotes || undefined,
      });

      toast.success('Homework task logged and tracked!');
      
      // Reset fields
      setHwTitle('');
      setHwDueDate('');
      setHwNotes('');
      setHwPriority('medium');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add homework task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revSubject) {
      toast.error('Please select a subject');
      return;
    }
    if (!revTopic) {
      toast.error('Please enter the revised topic');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/daily-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'revision',
          data: {
            date: todayStr,
            subject: revSubject,
            topic: revTopic,
            confidenceLevel: revConfidence,
            notes: revNotes,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to save manual revision');
      toast.success('Revision logged successfully!');
      
      // Reset fields
      setRevTopic('');
      setRevNotes('');
      setRevConfidence('medium');
    } catch (err: any) {
      toast.error(err.message || 'Failed to log revision');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDrill = async (id: string, currentStatus: boolean) => {
    try {
      await toggleRecurringTask(id, todayStr, !currentStatus);
      toast.success('Math drill status updated!');
    } catch (err) {
      toast.error('Failed to update drill status');
    }
  };

  // Drills completion calculations
  const totalDrills = recurringTasks.length;
  const completedDrills = recurringTasks.filter(t => t.isCompleted).length;
  const drillPercentage = totalDrills > 0 ? Math.round((completedDrills / totalDrills) * 100) : 0;

  return (
    <LayoutWrapper
      title="Daily Log Entry"
      subtitle="Record your after-class tutoring details, log assigned homework, and mark off standard math drills."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Logging Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-border bg-slate-50/50">
              <button
                type="button"
                onClick={() => setActiveTab('tuition')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border-b-2 transition-all ${
                  activeTab === 'tuition'
                    ? 'border-primary text-primary bg-white font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Log Tuition</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('homework')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border-b-2 transition-all ${
                  activeTab === 'homework'
                    ? 'border-primary text-primary bg-white font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Log Homework</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('revision')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border-b-2 transition-all ${
                  activeTab === 'revision'
                    ? 'border-primary text-primary bg-white font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <RotateCw className="w-4 h-4" />
                <span>Manual Revision</span>
              </button>
            </div>

            {/* Forms Panel */}
            <div className="p-8">
              
              {/* Tuition Entry Form */}
              {activeTab === 'tuition' && (
                <form onSubmit={handleLogTuition} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                      <select
                        required
                        value={tuitionSubject}
                        onChange={(e) => setTuitionSubject(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                      >
                        <option value="">Select subject...</option>
                        {subjects.map((sub: string) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        required
                        min="15"
                        step="15"
                        value={tuitionDuration}
                        onChange={(e) => setTuitionDuration(parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Topic Studied</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chemical Bonding (Lewis Structures)"
                      value={tuitionTopic}
                      onChange={(e) => setTuitionTopic(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Concepts Taught</label>
                    <textarea
                      placeholder="List specific theorems, equations, definitions, or questions solved during this class..."
                      rows={4}
                      value={tuitionConcepts}
                      onChange={(e) => setTuitionConcepts(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tutor Notes (Optional)</label>
                    <textarea
                      placeholder="Homework guidelines, test scheduled by tutor, or performance feedback..."
                      rows={2}
                      value={tutorNotes}
                      onChange={(e) => setTutorNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 resize-none"
                    />
                  </div>

                  <div className="bg-blue-50/50 border border-primary/10 rounded-xl p-4 flex items-start space-x-3 text-xs text-primary-dark">
                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold">Auto-Scheduled Spaced Revisions</span>
                      <span className="font-medium text-slate-500 leading-normal">
                        Saving this entry automatically schedules 4 spaced revisions in your calendar: after +1, +3, +7, and +15 days.
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving Tuition Entry...</span>
                      </>
                    ) : (
                      <span>Save Tuition Log & Schedule Revisions</span>
                    )}
                  </button>
                </form>
              )}

              {/* Homework Entry Form */}
              {activeTab === 'homework' && (
                <form onSubmit={handleLogHomework} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                      <select
                        required
                        value={hwSubject}
                        onChange={(e) => setHwSubject(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                      >
                        <option value="">Select subject...</option>
                        {subjects.map((sub: string) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority Level</label>
                      <select
                        value={hwPriority}
                        onChange={(e) => setHwPriority(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Homework Description</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Complete Exercise 12, Questions 1-5"
                        value={hwTitle}
                        onChange={(e) => setHwTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                      <input
                        type="date"
                        required
                        value={hwDueDate}
                        onChange={(e) => setHwDueDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teacher Guidelines / Notes (Optional)</label>
                    <textarea
                      placeholder="Include question page numbers, submission details, or tutor feedback guidelines..."
                      rows={3}
                      value={hwNotes}
                      onChange={(e) => setHwNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving Homework Task...</span>
                      </>
                    ) : (
                      <span>Save Homework Assignment</span>
                    )}
                  </button>
                </form>
              )}

              {/* Revision Entry Form */}
              {activeTab === 'revision' && (
                <form onSubmit={handleLogRevision} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                      <select
                        required
                        value={revSubject}
                        onChange={(e) => setRevSubject(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                      >
                        <option value="">Select subject...</option>
                        {subjects.map((sub: string) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Self-Assessment Confidence</label>
                      <select
                        value={revConfidence}
                        onChange={(e) => setRevConfidence(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                      >
                        <option value="low">Low - Need practice</option>
                        <option value="medium">Medium - Good grasp</option>
                        <option value="high">High - Ready for exam</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Topic Revised</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Force and Motion (Numerical Exercises)"
                      value={revTopic}
                      onChange={(e) => setRevTopic(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Revision Summary / Self-Study Notes</label>
                    <textarea
                      placeholder="Write summary notes, rules remembered, test scores achieved, or things to ask your tutor..."
                      rows={4}
                      value={revNotes}
                      onChange={(e) => setRevNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving Revision...</span>
                      </>
                    ) : (
                      <span>Log Manual Revision Completion</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recurring Table Drills */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="border-b border-border pb-4 mb-6">
              <h3 className="font-hanken font-bold text-base text-slate-800 flex items-center space-x-2">
                <Percent className="w-5 h-5 text-primary" />
                <span>Daily Math Table Drills</span>
              </h3>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Recite/practice multiplication tables 12 to 19 daily to boost calculation speed.
              </p>
            </div>

            {/* Drill Progress Widget */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 mb-6 flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-slate-800 font-hanken tracking-tight">
                  {completedDrills}/{totalDrills}
                </span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Drills Completed Today
                </span>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center bg-primary/5 rounded-full border border-primary/10">
                <span className="text-xs font-black text-primary font-mono">{drillPercentage}%</span>
              </div>
            </div>

            {/* Drill Items List */}
            {isLoading && totalDrills === 0 ? (
              <div className="space-y-3 py-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-50 border border-slate-100 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {recurringTasks.map((task) => (
                  <button
                    key={task._id}
                    type="button"
                    onClick={() => handleToggleDrill(task._id, task.isCompleted)}
                    className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all text-left text-xs font-bold ${
                      task.isCompleted
                        ? 'bg-success/5 border-success/20 text-success'
                        : 'bg-background border-border text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-semibold">{task.taskName} Practice</span>
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-success stroke-[2.5]" />
                    ) : (
                      <Circle className="w-4.5 h-4.5 text-slate-300" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </LayoutWrapper>
  );
}
