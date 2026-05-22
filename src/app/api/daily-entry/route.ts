import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import TuitionEntry from '@/models/TuitionEntry';
import HomeworkTask from '@/models/HomeworkTask';
import Revision from '@/models/Revision';
import { getSpacedRevisionDates, getLocalDateString } from '@/lib/utils';
import { z } from 'zod';

const tuitionSchema = z.object({
  date: z.string(),
  subject: z.string(),
  topic: z.string(),
  conceptsTaught: z.string().default(''),
  tutorNotes: z.string().optional(),
  duration: z.number().default(60),
  homeworkAssignedText: z.string().optional(),
  homeworkDueDate: z.string().optional(),
  homeworkPriority: z.enum(['low', 'medium', 'high']).default('medium'),
});

const homeworkSchema = z.object({
  date: z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  title: z.string().min(2, 'Homework title is required'),
  dueDate: z.string().min(8, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  notes: z.string().optional(),
});

const revisionSchema = z.object({
  date: z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  topic: z.string().min(2, 'Revision topic is required'),
  scheduledDate: z.string().min(8, 'Scheduled date is required'),
  intervalStage: z.number().int().positive().default(1),
  confidenceLevel: z.enum(['low', 'medium', 'high', 'unrated']).default('medium'),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { type, data } = body;

    await connectToDatabase();

    if (type === 'tuition') {
      const parseResult = tuitionSchema.safeParse(data);
      if (!parseResult.success) {
        return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
      }

      const {
        date,
        subject,
        topic,
        conceptsTaught,
        tutorNotes,
        duration,
        homeworkAssignedText,
        homeworkDueDate,
        homeworkPriority,
      } = parseResult.data;

      // 1. Create Tuition Entry
      const tuitionEntry = await TuitionEntry.create({
        userId,
        date,
        subject,
        topic,
        conceptsTaught,
        tutorNotes: tutorNotes || '',
        duration,
      });

      // 2. Create Homework Task if assigned
      let homeworkTask = null;
      if (homeworkAssignedText && homeworkDueDate) {
        homeworkTask = await HomeworkTask.create({
          userId,
          date,
          subject,
          title: homeworkAssignedText,
          dueDate: homeworkDueDate,
          status: 'assigned',
          priority: homeworkPriority,
          isRecurring: false,
        });
      }

      // 3. Automatically generate spaced revisions
      const revisionDates = getSpacedRevisionDates(date);
      const revisionPromises = revisionDates.map((rev) =>
        Revision.create({
          userId,
          date,
          subject,
          topic,
          scheduledDate: rev.date,
          intervalStage: rev.stage,
          isCompleted: false,
          confidenceLevel: 'unrated',
          notes: '',
        })
      );
      await Promise.all(revisionPromises);

      return NextResponse.json({
        message: 'Tuition log and spaced revisions created successfully',
        tuitionEntry,
        homeworkTask,
      });
    }

    if (type === 'homework') {
      const parseResult = homeworkSchema.safeParse(data);
      if (!parseResult.success) {
        return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
      }

      const homeworkTask = await HomeworkTask.create({
        userId,
        date: parseResult.data.date || getLocalDateString(),
        subject: parseResult.data.subject,
        title: parseResult.data.title,
        dueDate: parseResult.data.dueDate,
        status: 'assigned',
        priority: parseResult.data.priority,
        notes: parseResult.data.notes || '',
        isRecurring: false,
      });

      return NextResponse.json({
        message: 'Homework task added successfully',
        homeworkTask,
      });
    }

    if (type === 'revision') {
      const parseResult = revisionSchema.safeParse(data);
      if (!parseResult.success) {
        return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
      }

      const revision = await Revision.create({
        userId,
        date: parseResult.data.date || getLocalDateString(),
        subject: parseResult.data.subject,
        topic: parseResult.data.topic,
        scheduledDate: parseResult.data.scheduledDate || getLocalDateString(),
        intervalStage: parseResult.data.intervalStage,
        isCompleted: true,
        confidenceLevel: parseResult.data.confidenceLevel,
        notes: parseResult.data.notes || '',
      });

      return NextResponse.json({
        message: 'Manual revision logged successfully',
        revision,
      });
    }

    return NextResponse.json({ error: 'Invalid log type' }, { status: 400 });
  } catch (error: any) {
    console.error('Daily Entry API Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
