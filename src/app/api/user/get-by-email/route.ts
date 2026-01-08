import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserModel } from "@/model/user.model";

const emailSchema = z.object({
  email: z.string().email("Invalid email address")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email } = emailSchema.parse(body);

    const user = await UserModel.getByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = user.toObject();
    delete userData.password;
    delete userData.verificationCode;
    delete userData.verificationExpires;
    
    return NextResponse.json({
      user: userData
    });
    
  } catch (error) {
    console.error("Get user error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}
