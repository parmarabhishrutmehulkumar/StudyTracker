import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
  school: z.string().min(2, 'School name is required'),
  class: z.string().default('Class 10'),
  board: z.string().default('ICSE'),
  parentContact: z.string().min(10, 'Parent contact must be at least 10 digits'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Parse using schema
    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { name, email, password, mobile, school, class: userClass, board, parentContact } = parseResult.data;
    
    await connectToDatabase();
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A student with this email already exists' },
        { status: 400 }
      );
    }
    
    const hashedPassword = hashPassword(password);
    
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      mobile,
      school,
      class: userClass,
      board,
      parentContact,
      isOnboarded: false, // forces onboarding
    });
    
    return NextResponse.json(
      { message: 'Registration successful', userId: user._id.toString() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
