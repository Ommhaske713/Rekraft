import { NextRequest, NextResponse } from "next/server";
import { resolveRouteParams } from "@/types/AppRouteContext";
import type { AppRouteContext } from "@/types/AppRouteContext";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";

export async function GET(
  _req: NextRequest,
  context: AppRouteContext
) {
  try {
    const params = await resolveRouteParams(context);
    const id = typeof params?.id === "string" ? params.id : null;
    
    if (!id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await dbConnect();
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error("Database connection failed");
    }
    
    const collection = mongoose.connection.db.collection("users");

    const projection = { avatar: 1, fullName: 1, displayName: 1, name: 1, email: 1 };
    let objectId: mongoose.Types.ObjectId
    try {
      objectId = new mongoose.Types.ObjectId(id)
    } catch (parseError) {
      console.error("Invalid ID format", parseError)
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const user = await collection.findOne(
      { _id: objectId },
      { projection }
    );

    if (!user || !user.avatar) {
      const nameSource = user ? (user.fullName || user.displayName || user.name || user.email || '') : ''
      const initials = (nameSource || '')
        .toString()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s: string) => s[0].toUpperCase())
        .join('') || 'RK'

      const placeholderSvg = `<?xml version="1.0" encoding="UTF-8"?>
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0%" stop-color="#60a5fa"/>
              <stop offset="100%" stop-color="#34d399"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="#f0f4f8" />
          <g transform="translate(60,60)">
            <circle r="44" fill="url(#g)" />
            <text x="0" y="6" font-family="Inter, Roboto, Arial, sans-serif" font-size="36" font-weight="700" fill="#ffffff" text-anchor="middle">${initials}</text>
          </g>
        </svg>`

      return new NextResponse(placeholderSvg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400'
        }
      })
    }

    const contentType = user.avatar.contentType || ''
    if (!/^image\//.test(contentType)) {
      const nameSource = (user.fullName || user.displayName || user.name || user.email || '')
      const initials = (nameSource || '')
        .toString()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s: string) => s[0].toUpperCase())
        .join('') || 'RK'

      const placeholderSvg = `<?xml version="1.0" encoding="UTF-8"?>
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0%" stop-color="#60a5fa"/>
              <stop offset="100%" stop-color="#34d399"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="#f0f4f8" />
          <g transform="translate(60,60)">
            <circle r="44" fill="url(#g)" />
            <text x="0" y="6" font-family="Inter, Roboto, Arial, sans-serif" font-size="36" font-weight="700" fill="#ffffff" text-anchor="middle">${initials}</text>
          </g>
        </svg>`

      return new NextResponse(placeholderSvg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400'
        }
      })
    }

    const response = new NextResponse(Buffer.from(user.avatar.data, 'base64'), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      }
    });

    return response;
  } catch (error) {
    console.error("Error retrieving image:", error);
    return NextResponse.json(
      { error: "Failed to retrieve image" },
      { status: 500 }
    );
  }
}