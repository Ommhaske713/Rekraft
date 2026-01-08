import { NextRequest, NextResponse } from "next/server";
import { resolveRouteParams } from "@/types/AppRouteContext";
import type { AppRouteContext } from "@/types/AppRouteContext";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";

const MAX_FILE_SIZE = 5 * 1024 * 1024; 

export async function PATCH(
    req: NextRequest,
    context: AppRouteContext
) {
    try {
        const params = await resolveRouteParams(context);
        const id = typeof params?.id === 'string' ? params.id : null;

        if (!id) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        await dbConnect();
        if (!mongoose.connection || !mongoose.connection.db) {
            throw new Error("Database connection failed");
        }

        const collection = mongoose.connection.db.collection("users");

        const user = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const createdAt = new Date(user.createdAt);
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        if (createdAt < tenMinutesAgo) {
            return NextResponse.json({ error: "Upload window expired" }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get('avatar') as File;

        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "Image too large (max 5MB)" }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const base64Image = buffer.toString('base64');
        const contentType = file.type;

        await collection.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            {
                $set: {
                    avatar: {
                        data: base64Image,
                        contentType: contentType
                    },
                    updatedAt: new Date()
                }
            }
        );

        return NextResponse.json({
            success: true,
            message: "Profile image uploaded successfully"
        });

    } catch (error) {
        console.error("Avatar upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}