import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import TuitionEntry from '@/models/TuitionEntry';
import HomeworkTask from '@/models/HomeworkTask';
import Revision from '@/models/Revision';
import RecurringTask from '@/models/RecurringTask';
import { getLocalDateString, calculateMetrics } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const today = getLocalDateString();

    // 1. Automatic Overdue Detection
    // Mark any homework where dueDate < today and status is not completed as overdue
    await HomeworkTask.updateMany(
      {
        userId,
        status: { $in: ['assigned', 'ongoing'] },
        dueDate: { $lt: today },
      },
      { $set: { status: 'overdue' } }
    );

    // 2. Fetch all collections data
    const homeworks = await HomeworkTask.find({ userId });
    const revisions = await Revision.find({ userId });
    const tuitions = await TuitionEntry.find({ userId });
    const recurring = await RecurringTask.find({ userId });

    // Counts
    const homeworkPending = homeworks.filter(h => h.status !== 'completed').length;
    const revisionDue = revisions.filter(r => !r.isCompleted && r.scheduledDate <= today).length;
    
    // Missed tasks: Overdue homework + overdue revisions + incomplete recurring tasks for today
    const overdueHomeworkCount = homeworks.filter(h => h.status === 'overdue').length;
    const overdueRevisionCount = revisions.filter(r => !r.isCompleted && r.scheduledDate < today).length;
    
    const todayRecurring = recurring.filter(r => r.date === today);
    const incompleteTodayRecurringCount = todayRecurring.length > 0
      ? todayRecurring.filter(r => !r.isCompleted).length
      : 8; // Default 8 multiplication tables incomplete if not logged today

    const missedTasks = overdueHomeworkCount + overdueRevisionCount + incompleteTodayRecurringCount;

    // 3. Reliability and Consistency Score Calculations
    // Get unique activity dates for the last 14 days
    const activityDates = new Set<string>();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    const fourteenDaysAgoStr = getLocalDateString(fourteenDaysAgo);

    tuitions.forEach(t => { if (t.date >= fourteenDaysAgoStr) activityDates.add(t.date); });
    homeworks.forEach(h => {
      if (h.date >= fourteenDaysAgoStr) activityDates.add(h.date);
      if (h.status === 'completed' && h.updatedAt) {
        const compDate = getLocalDateString(new Date(h.updatedAt));
        if (compDate >= fourteenDaysAgoStr) activityDates.add(compDate);
      }
    });
    revisions.forEach(r => {
      if (r.isCompleted && r.updatedAt) {
        const compDate = getLocalDateString(new Date(r.updatedAt));
        if (compDate >= fourteenDaysAgoStr) activityDates.add(compDate);
      }
    });
    recurring.forEach(rec => {
      if (rec.isCompleted && rec.date >= fourteenDaysAgoStr) activityDates.add(rec.date);
    });

    const recentLogsCount = activityDates.size;

    // Metrics for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const thirtyDaysAgoStr = getLocalDateString(thirtyDaysAgo);

    const recentHomeworks = homeworks.filter(h => h.date >= thirtyDaysAgoStr);
    const assignedHomeworksCount = recentHomeworks.length;
    const completedHomeworksCount = recentHomeworks.filter(h => h.status === 'completed').length;

    const recentRevisions = revisions.filter(r => r.scheduledDate >= thirtyDaysAgoStr && r.scheduledDate <= today);
    const scheduledRevisionsCount = recentRevisions.length;
    const completedRevisionsCount = recentRevisions.filter(r => r.isCompleted).length;

    const overdueCount = overdueHomeworkCount + overdueRevisionCount;

    const metrics = calculateMetrics(
      recentLogsCount,
      assignedHomeworksCount,
      completedHomeworksCount,
      scheduledRevisionsCount,
      completedRevisionsCount,
      overdueCount
    );

    // 4. Weekly Trend (Last 7 Days Study Duration)
    const weeklyTrend: { date: string; duration: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateString(d);
      
      const dayTuitions = tuitions.filter(t => t.date === dStr);
      const totalDuration = dayTuitions.reduce((acc, curr) => acc + curr.duration, 0);
      
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyTrend.push({ date: label, duration: totalDuration });
    }

    // 5. Subject Distribution (Tuition hours count)
    const subjectMinutesMap: Record<string, number> = {};
    tuitions.forEach(t => {
      subjectMinutesMap[t.subject] = (subjectMinutesMap[t.subject] || 0) + t.duration;
    });

    const subjectDistribution = Object.keys(subjectMinutesMap).map(sub => ({
      name: sub,
      value: Math.round(subjectMinutesMap[sub] / 60 * 10) / 10, // convert to hours
    }));

    // 6. Heatmap Data (Count of activities per day for past 6 months)
    const heatmapData: Record<string, number> = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoStr = getLocalDateString(sixMonthsAgo);

    // Populate heatmap
    const addActivityToHeatmap = (dateStr: string) => {
      if (dateStr >= sixMonthsAgoStr) {
        heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
      }
    };

    tuitions.forEach(t => addActivityToHeatmap(t.date));
    homeworks.forEach(h => {
      addActivityToHeatmap(h.date);
      if (h.status === 'completed' && h.updatedAt) {
        addActivityToHeatmap(getLocalDateString(new Date(h.updatedAt)));
      }
    });
    revisions.forEach(r => {
      if (r.isCompleted && r.updatedAt) {
        addActivityToHeatmap(getLocalDateString(new Date(r.updatedAt)));
      }
    });
    recurring.forEach(rec => {
      if (rec.isCompleted) addActivityToHeatmap(rec.date);
    });

    // 7. Recent Activity Feed
    const recentActivities: any[] = [];
    // Sort tuitions by date desc
    tuitions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    homeworks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    revisions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Add tuition logs
    tuitions.slice(0, 5).forEach(t => {
      recentActivities.push({
        id: `t-${t._id}`,
        type: 'tuition',
        title: `Tuition logged for ${t.topic}`,
        date: t.date,
        subject: t.subject,
        timestamp: t.createdAt,
      });
    });

    // Add completed homeworks
    homeworks.filter(h => h.status === 'completed').slice(0, 5).forEach(h => {
      recentActivities.push({
        id: `h-${h._id}`,
        type: 'homework',
        title: `Completed: ${h.title}`,
        date: h.date,
        subject: h.subject,
        timestamp: h.updatedAt,
      });
    });

    // Add completed revisions
    revisions.filter(r => r.isCompleted).slice(0, 5).forEach(r => {
      recentActivities.push({
        id: `r-${r._id}`,
        type: 'revision',
        title: `Revised ${r.topic} (Stage ${r.intervalStage}d)`,
        date: r.scheduledDate,
        subject: r.subject,
        timestamp: r.updatedAt,
      });
    });

    // Sort combined activities by timestamp desc
    recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // 8. Upcoming Reminders
    const upcomingReminders: any[] = [];
    
    // Upcoming revisions (next 3 days)
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysLaterStr = getLocalDateString(threeDaysLater);

    revisions.filter(r => !r.isCompleted && r.scheduledDate >= today && r.scheduledDate <= threeDaysLaterStr).forEach(r => {
      upcomingReminders.push({
        id: `rem-r-${r._id}`,
        type: 'revision',
        title: `Revise ${r.topic} (${r.subject})`,
        date: r.scheduledDate,
      });
    });

    // Pending homeworks due soon
    homeworks.filter(h => h.status !== 'completed' && h.dueDate >= today && h.dueDate <= threeDaysLaterStr).forEach(h => {
      upcomingReminders.push({
        id: `rem-h-${h._id}`,
        type: 'homework',
        title: `Homework due: ${h.title}`,
        date: h.dueDate,
      });
    });

    // Sort upcoming reminders by date asc
    upcomingReminders.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      homeworkPending,
      revisionDue,
      missedTasks,
      studyConsistency: metrics.loggingConsistency,
      reliabilityScore: metrics.reliabilityScore,
      weeklyTrend,
      homeworkCompletionRate: metrics.homeworkCompletionRate,
      subjectDistribution,
      heatmapData,
      recentActivities: recentActivities.slice(0, 6),
      upcomingReminders: upcomingReminders.slice(0, 6),
    });
  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
