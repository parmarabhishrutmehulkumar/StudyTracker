import { create } from 'zustand';

interface Homework {
  _id: string;
  date: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'assigned' | 'ongoing' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

interface Revision {
  _id: string;
  date: string;
  subject: string;
  topic: string;
  scheduledDate: string;
  intervalStage: 1 | 3 | 7 | 15;
  isCompleted: boolean;
  confidenceLevel: 'low' | 'medium' | 'high' | 'unrated';
  notes?: string;
}

interface Tuition {
  _id: string;
  date: string;
  subject: string;
  topic: string;
  conceptsTaught: string;
  tutorNotes?: string;
  duration: number;
}

interface RecurringTask {
  _id: string;
  date: string;
  taskName: string;
  isCompleted: boolean;
}

interface DashboardStats {
  homeworkPending: number;
  revisionDue: number;
  missedTasks: number;
  studyConsistency: number; // 0-100
  reliabilityScore: number; // 0-100
  weeklyTrend: { date: string; duration: number }[];
  homeworkCompletionRate: number;
  subjectDistribution: { name: string; value: number }[];
  heatmapData: Record<string, number>; // dateStr -> intensity
  recentActivities: { id: string; type: string; title: string; date: string; subject: string }[];
  upcomingReminders: { id: string; type: string; title: string; date: string }[];
}

interface StudyPulseState {
  homeworks: Homework[];
  revisions: Revision[];
  tuitions: Tuition[];
  recurringTasks: RecurringTask[];
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  quickAddOpen: boolean;

  setQuickAddOpen: (open: boolean) => void;
  fetchDashboardData: () => Promise<void>;
  fetchHomeworks: () => Promise<void>;
  fetchRevisions: () => Promise<void>;
  fetchRecurringTasks: (date: string) => Promise<void>;
  
  addTuitionEntry: (entry: Omit<Tuition, '_id'>) => Promise<void>;
  addHomeworkTask: (task: Omit<Homework, '_id' | 'status'>) => Promise<void>;
  updateHomeworkStatus: (id: string, status: Homework['status']) => Promise<void>;
  toggleRecurringTask: (id: string, date: string, isCompleted: boolean) => Promise<void>;
  completeRevision: (id: string, confidenceLevel: Revision['confidenceLevel'], notes?: string) => Promise<void>;
}

export const useStore = create<StudyPulseState>((set, get) => ({
  homeworks: [],
  revisions: [],
  tuitions: [],
  recurringTasks: [],
  stats: null,
  isLoading: false,
  error: null,
  quickAddOpen: false,

  setQuickAddOpen: (open) => set({ quickAddOpen: open }),

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      set({ stats: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchHomeworks: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/homework');
      if (!res.ok) throw new Error('Failed to fetch homework tasks');
      const data = await res.json();
      set({ homeworks: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchRevisions: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/revision');
      if (!res.ok) throw new Error('Failed to fetch revisions');
      const data = await res.json();
      set({ revisions: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchRecurringTasks: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/recurring?date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch recurring tasks');
      const data = await res.json();
      set({ recurringTasks: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addTuitionEntry: async (entry) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/daily-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tuition', data: entry }),
      });
      if (!res.ok) throw new Error('Failed to save tuition entry');
      
      // Refresh dashboard data
      await get().fetchDashboardData();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  addHomeworkTask: async (task) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/daily-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'homework', data: task }),
      });
      if (!res.ok) throw new Error('Failed to add homework task');
      
      await get().fetchHomeworks();
      await get().fetchDashboardData();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateHomeworkStatus: async (id, status) => {
    // Optimistic UI update
    const previousHomeworks = get().homeworks;
    set({
      homeworks: previousHomeworks.map(hw => hw._id === id ? { ...hw, status } : hw)
    });

    try {
      const res = await fetch('/api/homework', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update homework status');
      
      await get().fetchDashboardData();
    } catch (err: any) {
      // rollback
      set({ homeworks: previousHomeworks, error: err.message });
    }
  },

  toggleRecurringTask: async (id, date, isCompleted) => {
    const previousTasks = get().recurringTasks;
    set({
      recurringTasks: previousTasks.map(task => task._id === id ? { ...task, isCompleted } : task)
    });

    try {
      const res = await fetch('/api/recurring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, date, isCompleted }),
      });
      if (!res.ok) throw new Error('Failed to toggle recurring task');
      
      await get().fetchDashboardData();
    } catch (err: any) {
      set({ recurringTasks: previousTasks, error: err.message });
    }
  },

  completeRevision: async (id, confidenceLevel, notes) => {
    const previousRevisions = get().revisions;
    set({
      revisions: previousRevisions.map(rev => 
        rev._id === id ? { ...rev, isCompleted: true, confidenceLevel, notes } : rev
      )
    });

    try {
      const res = await fetch('/api/revision', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isCompleted: true, confidenceLevel, notes }),
      });
      if (!res.ok) throw new Error('Failed to update revision status');
      
      await get().fetchDashboardData();
    } catch (err: any) {
      set({ revisions: previousRevisions, error: err.message });
    }
  },
}));
