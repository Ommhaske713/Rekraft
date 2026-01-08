import dbConnect from "@/lib/dbConnect";
import { customerSchema, sellerSchema } from "@/schema/user.schema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import crypto from "crypto";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { role } = body;
    
    if (!role || (role !== "customer" && role !== "seller")) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    if (body.name && !body.username) {
      body.username = body.name;
      console.log("Mapped name to username:", body);
    }

    let userData;
    if (role === "customer") {
      userData = customerSchema.parse(body);
    } else {
      userData = sellerSchema.parse(body);
    }

    await dbConnect();

    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error("Database connection failed");
    }
    
    const collection = mongoose.connection.db.collection("users");

    const existingUser = await collection.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); 

    const newUser = {
      ...userData,
      password: hashedPassword,
      verified: false,
      verificationCode,
      verificationExpires,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newUser);

    try {
      const emailResponse = await sendVerificationEmail(
        userData.email,
        userData.username,
        verificationCode,
        {
          expiresInMinutes: 10,
          fromName: "Rekraft",
          appName: "Rekraft",
          logoUrl: "" 
        }
      );
      
      if (!emailResponse.success) {
        console.error("Failed to send verification email:", emailResponse.errors);
      }
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    const { password, verificationCode: codeToDiscard, ...userWithoutSensitiveData } = newUser;
    void password;
    void codeToDiscard;
    
    return NextResponse.json(
      { 
        message: "User registered successfully. Please verify your email to activate your account.", 
        user: userWithoutSensitiveData,
        id: result.insertedId 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}