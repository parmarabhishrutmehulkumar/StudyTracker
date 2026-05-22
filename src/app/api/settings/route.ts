import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, hashPassword } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import TuitionEntry from '@/models/TuitionEntry';
import HomeworkTask from '@/models/HomeworkTask';
import Revision from '@/models/Revision';
import RecurringTask from '@/models/RecurringTask';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Settings GET Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, school, parentContact, tuition, studyGoal, reminderTime, subjects, password } = body;

    await connectToDatabase();

    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (school) updateFields.school = school;
    if (parentContact) updateFields.parentContact = parentContact;
    if (tuition !== undefined) updateFields.tuition = tuition;
    if (studyGoal) updateFields.studyGoal = studyGoal;
    if (reminderTime) updateFields.reminderTime = reminderTime;
    if (subjects !== undefined) updateFields.subjects = subjects;
    
    if (password) {
      updateFields.password = hashPassword(password);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Settings PUT Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    // Delete user and all associated records
    await User.findByIdAndDelete(userId);
    await TuitionEntry.deleteMany({ userId });
    await HomeworkTask.deleteMany({ userId });
    await Revision.deleteMany({ userId });
    await RecurringTask.deleteMany({ userId });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Settings DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
