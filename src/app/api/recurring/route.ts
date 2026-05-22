import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import RecurringTask from '@/models/RecurringTask';

const DRILL_TASKS = [
  'Tables 12',
  'Tables 13',
  'Tables 14',
  'Tables 15',
  'Tables 16',
  'Tables 17',
  'Tables 18',
  'Tables 19',
];

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    // Find existing tasks for this user and date
    let tasks = await RecurringTask.find({ userId, date });

    // If none exist, pre-populate them
    if (tasks.length === 0) {
      const tasksToCreate = DRILL_TASKS.map((taskName) => ({
        userId,
        date,
        taskName,
        isCompleted: false,
      }));

      try {
        await RecurringTask.insertMany(tasksToCreate);
        tasks = await RecurringTask.find({ userId, date });
      } catch (insertError: any) {
        // Handle race conditions where another call might have created them
        tasks = await RecurringTask.find({ userId, date });
      }
    }

    // Sort tasks logically by taskName (Tables 12, Tables 13, etc.)
    tasks.sort((a, b) => a.taskName.localeCompare(b.taskName, undefined, { numeric: true }));

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('Recurring GET API Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, isCompleted } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const updatedTask = await RecurringTask.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isCompleted } },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: 'Recurring task not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error('Recurring PUT API Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
