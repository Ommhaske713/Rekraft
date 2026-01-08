import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { UserModel } from "@/model/user.model";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email as string;

    const user = await UserModel.getByEmail(email);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "seller") {
      return NextResponse.json({ error: "Access denied: Not a seller account" }, { status: 403 });
    }

    const safeSellerData = JSON.parse(JSON.stringify(user));
    delete safeSellerData.password;
    delete safeSellerData.verificationCode;
    delete safeSellerData.verificationExpires;

    return NextResponse.json({
      success: true,
      seller: safeSellerData
    });
  } catch (error) {
    console.error("Error fetching seller data:", error);
    return NextResponse.json(
      { error: "Failed to fetch seller data" },
      { status: 500 }
    );
  }
}