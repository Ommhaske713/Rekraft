import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { UserModel } from '@/model/user.model';

const verifySchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().min(6, 'Verification code must be at least 6 characters')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = verifySchema.parse(body);

    await dbConnect();

    const user = await UserModel.findByVerificationCode(email, code) as { _id: string } | null;
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    await UserModel.verifyUser(user._id);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}