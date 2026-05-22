'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import LayoutWrapper from '@/components/layout-wrapper';
import { 
  ClipboardList,
  Play, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Calendar,
  Tag, 
  ChevronRight, 
  ChevronLeft, 
  MoveRight,
  Filter,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';

const COLUMNS = [
  { id: 'assigned', title: 'Assigned', color: 'border-primary bg-primary/5 text-primary' },
  { id: 'ongoing', title: 'Ongoing', color: 'border-warning bg-warning/5 text-warning' },
  { id: 'completed', title: 'Completed', color: 'border-success bg-success/5 text-success' },
  { id: 'overdue', title: 'Overdue', color: 'border-critical bg-critical/5 text-critical' },
];

export default function HomeworkPage() {
  const { homeworks, fetchHomeworks, updateHomeworkStatus, setQuickAddOpen, isLoading } = useStore();
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  useEffect(() => {
    fetchHomeworks();
  }, [fetchHomeworks]);

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      await updateHomeworkStatus(id, newStatus);
      toast.success(`Task moved to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task status');
    }
  };

  // Get distinct subjects from current homework tasks
  const homeworkSubjects = ['All', ...Array.from(new Set(homeworks.map(hw => hw.subject)))];

  // Filtered homework list
  const filteredHomeworks = homeworks.filter(hw => {
    const matchSubject = selectedSubject === 'All' || hw.subject === selectedSubject;
    const matchPriority = selectedPriority === 'All' || hw.priority === selectedPriority;
    return matchSubject && matchPriority;
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-critical/10 text-critical border-critical/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <LayoutWrapper
      title="Homework Planner"
      subtitle="Organize school assignments and tutoring tasks. Drag, move, and complete items to avoid reliability penalties."
    >
      <div className="space-y-6">
        
        {/* Header Actions & Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface border border-border p-4.5 rounded-2xl shadow-sm">
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Subject Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-slate-700"
              >
                {homeworkSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center space-x-2 border-l border-border pl-4">
              <Tag className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-1.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-slate-700"
              >
                <option value="All">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchHomeworks()}
              className="p-2 border border-border rounded-xl bg-background hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
              title="Refresh board"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setQuickAddOpen(true)}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Homework</span>
            </button>
          </div>
        </div>

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {COLUMNS.map((col) => {
            const columnTasks = filteredHomeworks.filter(hw => hw.status === col.id);
            return (
              <div key={col.id} className="flex flex-col bg-slate-50/50 border border-slate-100 rounded-2xl p-4 min-h-[500px]">
                
                {/* Column Title */}
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full border ${col.color.split(' ')[0]}`} />
                    <h3 className="font-hanken font-bold text-sm text-slate-700">{col.title}</h3>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {columnTasks.length > 0 ? (
                    columnTasks.map((hw) => (
                      <div
                        key={hw._id}
                        className="bg-surface border border-border rounded-xl p-4 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow group"
                      >
                        <div>
                          {/* Subject & Priority */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase text-primary font-mono tracking-wider">
                              {hw.subject}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getPriorityStyle(hw.priority)}`}>
                              {hw.priority}
                            </span>
                          </div>

                          {/* Description */}
                          <h4 className="text-xs font-bold text-slate-700 leading-snug">
                            {hw.title}
                          </h4>

                          {/* Notes */}
                          {hw.notes && (
                            <p className="text-[10px] text-slate-400 font-medium mt-1.5 line-clamp-2">
                              {hw.notes}
                            </p>
                          )}
                        </div>

                        {/* Card Footer: Due Date & Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px]">
                          <div className="flex items-center space-x-1 font-bold text-slate-400 font-mono">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Due: {hw.dueDate}</span>
                          </div>

                          {/* Transition Buttons */}
                          <div className="flex items-center space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {col.id === 'assigned' && (
                              <button
                                onClick={() => handleStatusChange(hw._id, 'ongoing')}
                                className="p-1 hover:bg-warning/10 text-warning hover:text-warning-dark border border-transparent hover:border-warning/20 rounded-md transition-colors"
                                title="Move to Ongoing"
                              >
                                <Play className="w-3 h-3" />
                              </button>
                            )}

                            {(col.id === 'assigned' || col.id === 'ongoing' || col.id === 'overdue') && (
                              <button
                                onClick={() => handleStatusChange(hw._id, 'completed')}
                                className="p-1 hover:bg-success/10 text-success hover:text-success-dark border border-transparent hover:border-success/20 rounded-md transition-colors"
                                title="Mark Completed"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </button>
                            )}

                            {col.id === 'ongoing' && (
                              <button
                                onClick={() => handleStatusChange(hw._id, 'assigned')}
                                className="p-1 hover:bg-primary/10 text-primary hover:text-primary-dark border border-transparent hover:border-primary/20 rounded-md transition-colors"
                                title="Move back to Assigned"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                            )}

                            {col.id === 'completed' && (
                              <button
                                onClick={() => handleStatusChange(hw._id, 'ongoing')}
                                className="p-1 hover:bg-warning/10 text-warning hover:text-warning-dark border border-transparent hover:border-warning/20 rounded-md transition-colors"
                                title="Re-open task"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="h-28 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center text-slate-300 p-4">
                      <FolderOpen className="w-5 h-5 mb-1.5 stroke-[1.5]" />
                      <p className="text-[10px] font-bold">No tasks</p>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </LayoutWrapper>
  );
}
