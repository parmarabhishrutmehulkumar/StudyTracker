import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalDateString(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

export function getSpacedRevisionDates(startDateStr: string): { stage: 1 | 3 | 7 | 15; date: string }[] {
  const intervals: (1 | 3 | 7 | 15)[] = [1, 3, 7, 15];
  return intervals.map((days) => {
    const d = new Date(startDateStr);
    d.setDate(d.getDate() + days);
    return {
      stage: days,
      date: d.toISOString().split('T')[0],
    };
  });
}

interface PerformanceMetrics {
  loggingConsistency: number; // 0 to 100
  homeworkCompletionRate: number; // 0 to 100
  revisionCompletionRate: number; // 0 to 100
  reliabilityScore: number; // 0 to 100
  backlogScore: number; // 0 to 100
}

/**
 * Calculates student reliability metrics based on logs, homeworks, and revisions.
 */
export function calculateMetrics(
  recentLogsCount: number, // out of last 14 days
  assignedHomeworksCount: number,
  completedHomeworksCount: number,
  scheduledRevisionsCount: number,
  completedRevisionsCount: number,
  overdueTasksCount: number
): PerformanceMetrics {
  // Logging Consistency: percentage of last 14 days that had an activity
  const loggingConsistency = Math.min(100, Math.round((recentLogsCount / 14) * 100));

  // Homework Completion Rate
  const homeworkCompletionRate = assignedHomeworksCount > 0 
    ? Math.min(100, Math.round((completedHomeworksCount / assignedHomeworksCount) * 100))
    : 100;

  // Revision Completion Rate
  const revisionCompletionRate = scheduledRevisionsCount > 0
    ? Math.min(100, Math.round((completedRevisionsCount / scheduledRevisionsCount) * 100))
    : 100;

  // Backlog Score: representation of uncompleted items. Maxes out at 100 (worse backlog)
  const backlogScore = Math.min(100, overdueTasksCount * 10);

  // Reliability Score: 40% Logging Consistency, 30% Homework, 30% Revision
  // Deduct points for overdue backlog items
  let rawReliability = (loggingConsistency * 0.4) + (homeworkCompletionRate * 0.3) + (revisionCompletionRate * 0.3);
  rawReliability -= overdueTasksCount * 2; // penalty

  const reliabilityScore = Math.max(0, Math.min(100, Math.round(rawReliability)));

  return {
    loggingConsistency,
    homeworkCompletionRate,
    revisionCompletionRate,
    reliabilityScore,
    backlogScore,
  };
}
