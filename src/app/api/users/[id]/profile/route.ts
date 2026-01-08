import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { UserModel } from "@/model/user.model";
import { z } from "zod";
import rateLimit from "@/lib/rateLimit";
import AuditLog from "@/lib/audit.model";
import { resolveRouteParams } from "@/types/AppRouteContext";
import type { AppRouteContext } from "@/types/AppRouteContext";

interface SessionUser {
  id: string;
  email: string;
}

interface Session {
  user?: SessionUser;
}

const addressSchema = z.object({
  street: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  country: z.string().min(1).optional()
}).refine(val => !val || Object.values(val).every(field => field), {
  message: "All address fields must be provided together"
});

const profileSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  phone: z.string().min(5).max(20).optional(),
  email: z.string().email().optional(),
  address: addressSchema.optional(),
  businessName: z.string().min(2).max(100).optional(),
  taxId: z.string().optional(),
  businessDescription: z.string().max(1000).optional(),
  negotiable: z.boolean().optional()
});

export async function PATCH(
  req: NextRequest,
  context: AppRouteContext
) {
  try {
    const params = await resolveRouteParams(context);
    const id = params?.id;

    if (!id || typeof id !== 'string' || id.length < 5) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { success } = await rateLimit.limit(session.user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const userData = validation.data;
    
    try {
      if (userData.address && Object.values(userData.address).some(field => field === undefined)) {
        return NextResponse.json(
          { error: "Incomplete address fields" },
          { status: 400 }
        );
      }

      const updatedUser = await UserModel.updateUser(id, {
        ...userData,
        address: userData.address && {
          street: userData.address.street!,
          city: userData.address.city!,
          state: userData.address.state!,
          postalCode: userData.address.postalCode!,
          country: userData.address.country!
        }
      });

      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await AuditLog.create({
        userId: id,
        action: "PROFILE_UPDATE",
        details: `Updated fields: ${Object.keys(userData).join(", ")}`
      });

      return NextResponse.json({
        success: true,
        data: updatedUser
      });
    } catch (dbError) {
      console.error("Database update error:", dbError);
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}