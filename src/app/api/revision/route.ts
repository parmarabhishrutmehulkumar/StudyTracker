import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Revision from '@/models/Revision';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const revisions = await Revision.find({ userId }).sort({ scheduledDate: 1 });

    return NextResponse.json(revisions);
  } catch (error: any) {
    console.error('Revision GET Error:', error);
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
    const { id, isCompleted, confidenceLevel, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Revision ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const revision = await Revision.findOne({ _id: id, userId });
    if (!revision) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }

    const updates: any = {};
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;
    if (confidenceLevel) updates.confidenceLevel = confidenceLevel;
    if (notes !== undefined) updates.notes = notes;

    const updatedRevision = await Revision.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json(updatedRevision);
  } catch (error: any) {
    console.error('Revision PUT Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
