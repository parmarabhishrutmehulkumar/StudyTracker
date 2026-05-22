import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';

const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  school: z.string().min(2, 'School name is required'),
  board: z.string().default('ICSE'),
  class: z.string().default('Class 10'),
  parentContact: z.string().min(10, 'Parent contact must be at least 10 digits'),
  tuition: z.boolean().default(true),
  studyGoal: z.string().min(5, 'Please provide a clear study goal'),
  reminderTime: z.string().default('20:00'),
  subjects: z.array(z.string()).min(1, 'Please select at least one subject'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const parseResult = onboardingSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: parseResult.data.name,
          school: parseResult.data.school,
          board: parseResult.data.board,
          class: parseResult.data.class,
          parentContact: parseResult.data.parentContact,
          tuition: parseResult.data.tuition,
          studyGoal: parseResult.data.studyGoal,
          reminderTime: parseResult.data.reminderTime,
          subjects: parseResult.data.subjects,
          isOnboarded: true,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        isOnboarded: updatedUser.isOnboarded,
        subjects: updatedUser.subjects,
      },
    });
  } catch (error: any) {
    console.error('Onboarding API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
