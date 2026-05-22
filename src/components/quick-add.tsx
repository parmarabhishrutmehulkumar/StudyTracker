'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSession } from 'next-auth/react';
import { Plus, X, BookOpen, ClipboardList, RotateCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getLocalDateString } from '@/lib/utils';

export default function QuickAdd() {
  const { data: session } = useSession();
  const { quickAddOpen, setQuickAddOpen, addTuitionEntry, addHomeworkTask } = useStore();
  const [activeTab, setActiveTab] = useState<'tuition' | 'homework' | 'revision'>('tuition');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [conceptsTaught, setConceptsTaught] = useState('');
  
  const [hwTitle, setHwTitle] = useState('');
  const [hwDueDate, setHwDueDate] = useState('');
  const [hwPriority, setHwPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const [revTopic, setRevTopic] = useState('');
  const [revNotes, setRevNotes] = useState('');

  const subjects = (session?.user as any)?.subjects || [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'
  ];

  const handleClose = () => {
    setQuickAddOpen(false);
    // Reset fields
    setSubject('');
    setTopic('');
    setDuration(60);
    setConceptsTaught('');
    setHwTitle('');
    setHwDueDate('');
    setHwPriority('medium');
    setRevTopic('');
    setRevNotes('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) {
      toast.error('Please select a subject');
      return;
    }

    setIsSaving(true);
    const today = getLocalDateString();

    try {
      if (activeTab === 'tuition') {
        if (!topic) {
          toast.error('Please specify the topic studied');
          setIsSaving(false);
          return;
        }
        await addTuitionEntry({
          date: today,
          subject,
          topic,
          conceptsTaught,
          duration,
        });
        toast.success('Tuition session logged & revisions scheduled!');
      } else if (activeTab === 'homework') {
        if (!hwTitle || !hwDueDate) {
          toast.error('Please enter homework title and due date');
          setIsSaving(false);
          return;
        }
        await addHomeworkTask({
          date: today,
          subject,
          title: hwTitle,
          dueDate: hwDueDate,
          priority: hwPriority,
        });
        toast.success('Homework task assigned successfully!');
      } else if (activeTab === 'revision') {
        if (!revTopic) {
          toast.error('Please enter the revision topic');
          setIsSaving(false);
          return;
        }
        
        // POST directly to manual revision log
        const res = await fetch('/api/daily-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'revision',
            data: {
              date: today,
              subject,
              topic: revTopic,
              confidenceLevel: 'medium',
              notes: revNotes,
            },
          }),
        });

        if (!res.ok) throw new Error('Failed to save revision');
        toast.success('Revision logged successfully!');
      }
      handleClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save entries');
    } finally {
      setIsSaving(false);
    }
  };

  if (!quickAddOpen) {
    return (
      <button
        onClick={() => setQuickAddOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer transition-all duration-150 z-50 group hover:scale-105"
        id="quick-add-fab"
      >
        <Plus className="w-7 h-7 transition-transform group-hover:rotate-90" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-hanken font-bold text-lg text-slate-800">Quick Log Study Activities</h3>
            <p className="text-slate-400 text-xs font-semibold">Enter after-tuition details instantly</p>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('tuition')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'tuition'
                ? 'border-primary text-primary bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tuition</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('homework')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'homework'
                ? 'border-primary text-primary bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Homework</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('revision')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'revision'
                ? 'border-primary text-primary bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            <span>Revision</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Universal Subject Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map((sub: string) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Tuition Fields */}
          {activeTab === 'tuition' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Topic / Chapter Name</label>
                <input
                  type="text"
                  placeholder="e.g. Quadratic Equations"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Duration (mins)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Study Date</label>
                  <input
                    type="text"
                    disabled
                    value="Today (Local)"
                    className="w-full px-3 py-2 bg-slate-50 border border-border rounded-lg text-sm text-slate-400 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Concepts Taught</label>
                <textarea
                  placeholder="Formulas, core rules, or key examples..."
                  rows={2}
                  value={conceptsTaught}
                  onChange={(e) => setConceptsTaught(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </>
          )}

          {/* Homework Fields */}
          {activeTab === 'homework' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Homework Description</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Exercise 5B, Questions 1-10"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                  <input
                    type="date"
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                  <select
                    value={hwPriority}
                    onChange={(e) => setHwPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Revision Fields */}
          {activeTab === 'revision' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Topic Revised</label>
                <input
                  type="text"
                  placeholder="e.g. Mole Concept Calculations"
                  value={revTopic}
                  onChange={(e) => setRevTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Revision / Self-Study Notes</label>
                <textarea
                  placeholder="Formulas re-written, mock test score, or confidence doubts..."
                  rows={3}
                  value={revNotes}
                  onChange={(e) => setRevNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors duration-150"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow hover:shadow-md disabled:opacity-50 transition-all duration-150"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Log Entry</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
