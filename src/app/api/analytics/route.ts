import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import TuitionEntry from '@/models/TuitionEntry';
import HomeworkTask from '@/models/HomeworkTask';
import Revision from '@/models/Revision';
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

    const tuitions = await TuitionEntry.find({ userId });
    const homeworks = await HomeworkTask.find({ userId });
    const revisions = await Revision.find({ userId });

    // 1. Calculations
    const totalHomeworks = homeworks.length;
    const completedHomeworks = homeworks.filter(h => h.status === 'completed').length;
    const homeworkCompletionRate = totalHomeworks > 0 ? Math.round((completedHomeworks / totalHomeworks) * 100) : 100;

    const totalRevisions = revisions.length;
    const completedRevisions = revisions.filter(r => r.isCompleted).length;
    const revisionCompletionRate = totalRevisions > 0 ? Math.round((completedRevisions / totalRevisions) * 100) : 100;

    // Consistency score (days with at least 1 log in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const thirtyDaysAgoStr = getLocalDateString(thirtyDaysAgo);

    const activeDays = new Set<string>();
    tuitions.forEach(t => { if (t.date >= thirtyDaysAgoStr) activeDays.add(t.date); });
    homeworks.forEach(h => {
      if (h.date >= thirtyDaysAgoStr) activeDays.add(h.date);
      if (h.status === 'completed' && h.updatedAt) {
        activeDays.add(getLocalDateString(new Date(h.updatedAt)));
      }
    });
    revisions.forEach(r => {
      if (r.isCompleted && r.updatedAt) {
        activeDays.add(getLocalDateString(new Date(r.updatedAt)));
      }
    });

    const consistencyRate = Math.round((activeDays.size / 30) * 100);

    // Overdue tasks count
    const overdueHomework = homeworks.filter(h => h.status === 'overdue').length;
    const overdueRevisions = revisions.filter(r => !r.isCompleted && r.scheduledDate < today).length;
    const totalOverdue = overdueHomework + overdueRevisions;

    // Reliability score calculation
    let rawReliability = (consistencyRate * 0.4) + (homeworkCompletionRate * 0.3) + (revisionCompletionRate * 0.3);
    rawReliability -= totalOverdue * 2;
    const reliabilityScore = Math.max(0, Math.min(100, Math.round(rawReliability)));

    // Backlog score
    const backlogScore = Math.min(100, totalOverdue * 10);

    // 2. Weekly revision consistency (revised vs total scheduled per subject)
    const revisionSubjectStats: Record<string, { total: number; completed: number }> = {};
    revisions.forEach(r => {
      if (!revisionSubjectStats[r.subject]) {
        revisionSubjectStats[r.subject] = { total: 0, completed: 0 };
      }
      revisionSubjectStats[r.subject].total += 1;
      if (r.isCompleted) {
        revisionSubjectStats[r.subject].completed += 1;
      }
    });

    const revisionConsistencyChart = Object.keys(revisionSubjectStats).map(subject => ({
      subject,
      scheduled: revisionSubjectStats[subject].total,
      completed: revisionSubjectStats[subject].completed,
    }));

    // 3. Subject-wise tuition time (hours)
    const subjectHours: Record<string, number> = {};
    tuitions.forEach(t => {
      subjectHours[t.subject] = (subjectHours[t.subject] || 0) + t.duration;
    });
    const subjectDistribution = Object.keys(subjectHours).map(sub => ({
      name: sub,
      value: Math.round((subjectHours[sub] / 60) * 10) / 10,
    }));

    // 4. Smart Insights:
    // - Weak subjects: subjects with low confidence level revisions (or lowest completion rates)
    const subjectConfidenceSum: Record<string, { sum: number; count: number }> = {};
    revisions.forEach(r => {
      if (r.isCompleted && r.confidenceLevel !== 'unrated') {
        const val = r.confidenceLevel === 'low' ? 1 : r.confidenceLevel === 'medium' ? 3 : 5;
        if (!subjectConfidenceSum[r.subject]) {
          subjectConfidenceSum[r.subject] = { sum: 0, count: 0 };
        }
        subjectConfidenceSum[r.subject].sum += val;
        subjectConfidenceSum[r.subject].count += 1;
      }
    });

    const weakSubjects: string[] = [];
    Object.keys(subjectConfidenceSum).forEach(sub => {
      const avg = subjectConfidenceSum[sub].sum / subjectConfidenceSum[sub].count;
      if (avg < 3) {
        weakSubjects.push(sub);
      }
    });

    // If none found by confidence, add subjects with lowest revision rate
    if (weakSubjects.length === 0) {
      Object.keys(revisionSubjectStats).forEach(sub => {
        const rate = (revisionSubjectStats[sub].completed / revisionSubjectStats[sub].total) * 100;
        if (rate < 60) {
          weakSubjects.push(sub);
        }
      });
    }

    const insights: string[] = [];
    if (weakSubjects.length > 0) {
      insights.push(`Your lowest confidence level is in <strong>${weakSubjects.slice(0, 2).join(' & ')}</strong>. Dedicate extra revision sessions here.`);
    } else {
      insights.push('Great job! You maintain high confidence scores across all preloaded subjects.');
    }

    if (totalOverdue > 3) {
      insights.push(`You currently have a backlog of <strong>${totalOverdue} overdue tasks</strong>. Focus on clearing items in your Missed Tasks panel.`);
    } else {
      insights.push('Excellent workflow management: your pending backlog is extremely low.');
    }

    // Low consistency periods
    const lastWeekLogsCount = Array.from(activeDays).filter(d => {
      const dateDiff = (new Date(today).getTime() - new Date(d).getTime()) / (1000 * 3600 * 24);
      return dateDiff <= 7;
    }).length;

    if (lastWeekLogsCount < 3) {
      insights.push("Study consistency has dipped this past week. Log tuition work daily to rebuild your streak.");
    } else {
      insights.push("Strong weekly study streak! Keep up the daily tuition log consistency.");
    }

    return NextResponse.json({
      homeworkCompletionRate,
      revisionCompletionRate,
      consistencyRate,
      reliabilityScore,
      backlogScore,
      revisionConsistencyChart,
      subjectDistribution,
      insights,
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
