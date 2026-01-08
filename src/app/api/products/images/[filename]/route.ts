import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { resolveRouteParams } from "@/types/AppRouteContext";
import type { AppRouteContext } from "@/types/AppRouteContext";

export async function GET(
    req: NextRequest,
    context: AppRouteContext
) {
    try {
        const params = await resolveRouteParams(context);
        const filename = params?.filename;
        if (!filename) {
            return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
        }

        await dbConnect();
        if (!mongoose.connection || !mongoose.connection.db) {
            throw new Error("Database connection failed");
        }

        const collection = mongoose.connection.db.collection("productImages");

        const image = await collection.findOne({ filename });

        if (!image || !image.data) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        const response = new NextResponse(Buffer.from(image.data, 'base64'), {
            status: 200,
            headers: {
                'Content-Type': image.contentType || 'image/jpeg',
                'Cache-Control': 'public, max-age=86400'
            }
        });

        return response;
    } catch (error) {
        console.error("Error retrieving product image:", error);
        return NextResponse.json(
            { error: "Failed to retrieve image" },
            { status: 500 }
        );
    }
}