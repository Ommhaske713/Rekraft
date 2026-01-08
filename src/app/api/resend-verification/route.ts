import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import { UserModel } from '@/model/user.model';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resendSchema.parse(body);
    
    await dbConnect();

    const user = await UserModel.getByEmail(email.toLowerCase());
    
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, a new verification code has been sent.'
      });
    }
    
    if (user.verified) {
      return NextResponse.json(
        { error: 'Your email is already verified.' },
        { status: 400 }
      );
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); 

    await UserModel.updateUser(user._id as string, {
      verificationCode,
      verificationExpires
    });

    try {
      await sendVerificationEmail(email, user.username, verificationCode);
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }
    
    return NextResponse.json({
      success: true,
      message: 'A new verification code has been sent to your email.'
    });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to resend verification code' },
      { status: 500 }
    );
  }
}