import { NextRequest, NextResponse } from "next/server"
import { resolveRouteParams } from "@/types/AppRouteContext"
import type { AppRouteContext } from "@/types/AppRouteContext"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { UserModel, type User } from "@/model/user.model"

interface SessionUser {
  id: string;
  email: string;
}

interface Session {
  user?: SessionUser;
}

interface BaseUser {
  role: "seller" | "customer";
  email: string;
}


export async function GET(
  request: NextRequest,
  context: AppRouteContext
) {
  try {
    const params = await resolveRouteParams(context)
    const id = typeof params?.id === "string" ? params.id : null

    if (!id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await UserModel.getByEmail(session.user.email as string) as BaseUser | null
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let userData: User | null = null
    if (user.role === "seller") {
      userData = await UserModel.getSellerById(id)
    } else if (user.role === "customer") {
      userData = await UserModel.getCustomerById(id)
    }

    if (!userData) {
      return NextResponse.json({ error: "User details not found" }, { status: 404 })
    }

    const obj = JSON.parse(JSON.stringify(userData))
    delete obj.password;
    delete obj.verificationCode;
    delete obj.verificationExpires;

    return NextResponse.json({ user: obj, role: user.role })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}