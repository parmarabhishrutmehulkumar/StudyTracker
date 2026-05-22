import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import HomeworkTask from '@/models/HomeworkTask';
import Revision from '@/models/Revision';
import RecurringTask from '@/models/RecurringTask';
import { getLocalDateString } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const today = getLocalDateString();

    // 1. Fetch overdue homework (status === 'overdue' or status !== completed and dueDate < today)
    const overdueHomework = await HomeworkTask.find({
      userId,
      status: { $ne: 'completed' },
      dueDate: { $lt: today },
    }).sort({ dueDate: 1 });

    // 2. Fetch overdue revisions (isCompleted === false and scheduledDate < today)
    const overdueRevisions = await Revision.find({
      userId,
      isCompleted: false,
      scheduledDate: { $lt: today },
    }).sort({ scheduledDate: 1 });

    // 3. Fetch pending recurring tasks (today's incomplete recurring tasks)
    const todayRecurring = await RecurringTask.find({
      userId,
      date: today,
      isCompleted: false,
    }).sort({ taskName: 1 });

    // 4. Smart suggestions logic:
    // Sort suggestions based on priority:
    // - High priority homeworks first.
    // - Mathematics homeworks / revisions.
    // - Oldest overdue tasks first to prevent cascading backlog.
    const suggestions: string[] = [];

    if (overdueHomework.length > 0) {
      const highPriority = overdueHomework.find(h => h.priority === 'high');
      const mathHw = overdueHomework.find(h => h.subject.toLowerCase() === 'mathematics');

      if (highPriority) {
        suggestions.push(`Urgent: Complete your high-priority homework "${highPriority.title}" in ${highPriority.subject} first.`);
      } else if (mathHw) {
        suggestions.push(`Focus: Complete your overdue Mathematics homework "${mathHw.title}" to stay on track with your syllabus.`);
      } else {
        suggestions.push(`Clearing Backlog: Start with your oldest overdue homework "${overdueHomework[0].title}" (${overdueHomework[0].subject}).`);
      }
    }

    if (overdueRevisions.length > 0) {
      const mathRev = overdueRevisions.find(r => r.subject.toLowerCase() === 'mathematics');
      if (mathRev) {
        suggestions.push(`Spaced Repetition Alert: You missed a Mathematics revision for topic "${mathRev.topic}". Re-attempt it today to avoid forgetting.`);
      } else {
        suggestions.push(`Daily Revision: Revise "${overdueRevisions[0].topic}" in ${overdueRevisions[0].subject} to restore your spaced learning schedule.`);
      }
    }

    if (todayRecurring.length > 0) {
      suggestions.push(`Consistency Booster: Don't forget to complete your multiplication tables drills (${todayRecurring.slice(0, 3).map(t => t.taskName.replace('tables ', '')).join(', ')}...) today to maintain your logging streak.`);
    }

    if (suggestions.length === 0) {
      suggestions.push("Excellent work! You have no missed or overdue tasks. Keep up the high reliability.");
    }

    return NextResponse.json({
      overdueHomework,
      overdueRevisions,
      pendingRecurring: todayRecurring,
      suggestions,
    });
  } catch (error: any) {
    console.error('Missed Tasks API Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
