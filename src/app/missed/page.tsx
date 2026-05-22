
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import LayoutWrapper from '@/components/layout-wrapper';
import { useStore } from '@/store/useStore';
import { getLocalDateString } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  RotateCw,
  Sparkles,
  Loader2,
  Percent,
  CheckCircle2,
  Circle,
  X,
} from 'lucide-react';

interface HomeworkTask {
  _id: string;
  title: string;
  subject: string;
  dueDate: string;
}

interface RevisionTask {
  _id: string;
  topic: string;
  subject: string;
  intervalStage: number;
  scheduledDate: string;
}

interface RecurringTask {
  _id: string;
  taskName: string;
  isCompleted: boolean;
}

interface MissedData {
  overdueHomework: HomeworkTask[];
  overdueRevisions: RevisionTask[];
  pendingRecurring: RecurringTask[];
  suggestions: string[];
}

export default function MissedTasksPage() {
  const [missedData, setMissedData] = useState<MissedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedRevision, setSelectedRevision] = useState<RevisionTask | null>(null);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    updateHomeworkStatus,
    toggleRecurringTask,
    completeRevision,
  } = useStore();

  const todayStr = getLocalDateString();

  const fetchMissedData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const res = await fetch('/api/missed', {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch missed tasks');
      }

      const data = await res.json();
      setMissedData(data);
    } catch (error) {
      console.error(error);
      toast.error('Unable to load missed tasks');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMissedData();
  }, [fetchMissedData]);

  const totalOverdue = useMemo(() => {
    return (
      (missedData?.overdueHomework?.length || 0) +
      (missedData?.overdueRevisions?.length || 0) +
      (missedData?.pendingRecurring?.length || 0)
    );
  }, [missedData]);

  const handleCompleteHomework = async (id: string) => {
    try {
      await updateHomeworkStatus(id, 'completed');
      toast.success('Homework marked as completed');
      fetchMissedData(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to complete homework');
    }
  };

  const handleToggleDrill = async (
    id: string,
    currentStatus: boolean,
  ) => {
    try {
      await toggleRecurringTask(id, todayStr, !currentStatus);
      toast.success('Math drill updated');
      fetchMissedData(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update drill');
    }
  };

  const handleOpenCompletion = (revision: RevisionTask) => {
    setSelectedRevision(revision);
    setConfidence('medium');
    setNotes('');
  };

  const handleCloseCompletion = () => {
    setSelectedRevision(null);
    setNotes('');
    setConfidence('medium');
  };

  const handleSubmitCompletion = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!selectedRevision) return;

    try {
      setIsSubmitting(true);

      await completeRevision(
        selectedRevision._id,
        confidence,
        notes,
      );

      toast.success(
        `Revision completed for ${selectedRevision.topic}`,
      );

      handleCloseCompletion();
      fetchMissedData(true);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Failed to complete revision');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !missedData) {
    return (
      <LayoutWrapper
        title="Missed Tasks"
        subtitle="Checking overdue schedules..."
      >
        <div className="flex min-h-[350px] items-center justify-center">
          <Loader2 className="h-9 w-9 animate-spin text-primary" />
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper
      title="Missed Tasks & Remediation"
      subtitle="Resolve overdue work, missed revisions, and pending drills before they damage your momentum."
    >
      <div className="space-y-8">

        {/* HEADER STATUS */}
        <div
          className={`flex flex-col gap-4 rounded-2xl border p-6 shadow-sm md:flex-row md:items-center md:justify-between ${
            totalOverdue > 0
              ? 'border-red-200 bg-red-50/60'
              : 'border-emerald-200 bg-emerald-50/60'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`h-5 w-5 ${
                  totalOverdue > 0
                    ? 'text-red-500'
                    : 'text-emerald-500'
                }`}
              />

              <h2 className="font-hanken text-lg font-bold text-slate-800">
                {totalOverdue > 0
                  ? `${totalOverdue} Pending Backlog Items`
                  : 'Everything is cleared'}
              </h2>
            </div>

            <p className="mt-2 text-sm font-medium text-slate-500">
              {totalOverdue > 0
                ? 'Your pending workload is stacking up. Prioritize high-friction tasks first.'
                : 'Good job. No overdue academic tasks detected.'}
            </p>
          </div>

          <button
            onClick={() => fetchMissedData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCw className="h-4 w-4" />
            )}

            Refresh
          </button>
        </div>

        {/* SMART PLAN */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-hanken text-sm font-bold text-slate-800">
                Smart Remediation Plan
              </h3>

              <p className="text-xs font-medium text-slate-400">
                Recommended recovery order based on urgency and memory decay.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {missedData?.suggestions?.length ? (
              missedData.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                    {index + 1}
                  </div>

                  <p className="text-sm font-medium leading-relaxed text-slate-600">
                    {suggestion}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex h-28 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200">
                <CheckCircle className="mb-2 h-8 w-8 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-500">
                  No remediation recommendations needed.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* HOMEWORK */}
          <section className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />

                <h3 className="font-hanken text-sm font-bold text-slate-800">
                  Overdue Homework
                </h3>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                {missedData?.overdueHomework?.length || 0}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {missedData?.overdueHomework?.length ? (
                missedData.overdueHomework.map((hw) => (
                  <div
                    key={hw._id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wide text-primary">
                        {hw.subject}
                      </span>

                      <span className="rounded-md bg-red-100 px-2 py-1 text-[10px] font-bold text-red-600">
                        {hw.dueDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold leading-snug text-slate-700">
                      {hw.title}
                    </h4>

                    <button
                      onClick={() => handleCompleteHomework(hw._id)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primary-dark"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Complete Task
                    </button>
                  </div>
                ))
              ) : (
                <EmptyState message="No overdue homework tasks." />
              )}
            </div>
          </section>

          {/* REVISIONS */}
          <section className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <RotateCw className="h-5 w-5 text-amber-500" />

                <h3 className="font-hanken text-sm font-bold text-slate-800">
                  Missed Revisions
                </h3>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                {missedData?.overdueRevisions?.length || 0}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {missedData?.overdueRevisions?.length ? (
                missedData.overdueRevisions.map((revision) => (
                  <div
                    key={revision._id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wide text-amber-600">
                        {revision.subject}
                      </span>

                      <span className="rounded-md bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600">
                        Stage {revision.intervalStage}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold leading-snug text-slate-700">
                      {revision.topic}
                    </h4>

                    <p className="mt-2 text-[11px] font-semibold text-slate-400">
                      Planned Date: {revision.scheduledDate}
                    </p>

                    <button
                      onClick={() => handleOpenCompletion(revision)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-900 transition hover:bg-amber-500"
                    >
                      <RotateCw className="h-4 w-4" />
                      Revise Now
                    </button>
                  </div>
                ))
              ) : (
                <EmptyState message="No missed revisions." />
              )}
            </div>
          </section>

          {/* DRILLS */}
          <section className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-emerald-500" />

                <h3 className="font-hanken text-sm font-bold text-slate-800">
                  Pending Math Drills
                </h3>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                {missedData?.pendingRecurring?.length || 0}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {missedData?.pendingRecurring?.length ? (
                missedData.pendingRecurring.map((drill) => (
                  <button
                    key={drill._id}
                    onClick={() =>
                      handleToggleDrill(
                        drill._id,
                        drill.isCompleted,
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {drill.taskName}
                      </p>

                      <p className="mt-1 text-[11px] font-medium text-slate-400">
                        Daily repetition practice
                      </p>
                    </div>

                    {drill.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                  </button>
                ))
              ) : (
                <EmptyState message="All daily drills are completed." />
              )}
            </div>
          </section>
        </div>
      </div>

      {/* REVISION MODAL */}
      {selectedRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-hanken text-xl font-bold text-slate-800">
                  Complete Revision
                </h3>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  {selectedRevision.topic} · {selectedRevision.subject}
                </p>
              </div>

              <button
                onClick={handleCloseCompletion}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitCompletion}
              className="space-y-5"
            >
              <div>
                <label className="mb-3 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Recall Confidence
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setConfidence(level)}
                      className={`rounded-xl border px-4 py-3 text-sm font-bold capitalize transition ${
                        confidence === level
                          ? level === 'high'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : level === 'medium'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-red-500 bg-red-50 text-red-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Revision Notes
                </label>

                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write formulas revised, concepts forgotten, mistakes made in mock tests, etc..."
                  className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={handleCloseCompletion}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {isSubmitting
                    ? 'Saving...'
                    : 'Complete Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
      <CheckCircle2 className="mb-3 h-9 w-9 text-emerald-500" />

      <p className="text-sm font-semibold text-slate-500">
        {message}
      </p>
    </div>
  );
}

