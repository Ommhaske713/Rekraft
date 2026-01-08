import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { ProductModel } from "@/model/product.model";
import { UserModel } from "@/model/user.model";
import { resolveRouteParams } from "@/types/AppRouteContext";
import type { AppRouteContext } from "@/types/AppRouteContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const MAX_FILES = 5;

export async function POST(
    req: NextRequest,
    context: AppRouteContext
) {
    try {
        const params = await resolveRouteParams(context);
        const id = typeof params?.id === 'string' ? params.id : null;

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email as string;
        const user = await UserModel.getByEmail(email) as { _id: mongoose.Types.ObjectId, role: string };
        if (!user || user.role !== "seller") {
            return NextResponse.json({ error: "Only sellers can upload product images" }, { status: 403 });
        }

        const product = await ProductModel.findById(id);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (product.sellerId.toString() !== user._id.toString()) {
            return NextResponse.json({ error: "You don't have permission to modify this product" }, { status: 403 });
        }

        const formData = await req.formData();
        const files = formData.getAll('images') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        if (files.length > MAX_FILES) {
            return NextResponse.json({ error: `Maximum ${MAX_FILES} images allowed` }, { status: 400 });
        }

        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json({ error: "Images must be less than 5MB each" }, { status: 400 });
            }

            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
            }
        }

        await dbConnect();

        const imageUrls = [];

        for (const file of files) {
            const uniqueId = new mongoose.Types.ObjectId().toString();
            const extension = file.name.split('.').pop();
            const filename = `product_${id}_${uniqueId}.${extension}`;

            const buffer = Buffer.from(await file.arrayBuffer());

            if (!mongoose.connection.db) {
                throw new Error("Database connection is not established");
            }
            const collection = mongoose.connection.db.collection("productImages");
            await collection.insertOne({
                productId: id,
                filename,
                data: buffer.toString('base64'),
                contentType: file.type,
                createdAt: new Date()
            });

            imageUrls.push(`/api/products/images/${filename}`);
        }

        if (!mongoose.connection.db) {
            throw new Error("Database connection is not established");
        }
        await mongoose.connection.db.collection("products").updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: { images: imageUrls } }
        );

        return NextResponse.json({
            success: true,
            images: imageUrls
        });

    } catch (error) {
        console.error("Product image upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload product images" },
            { status: 500 }
        );
    }
}