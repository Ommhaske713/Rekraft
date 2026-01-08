import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { ProductModel } from "@/model/product.model";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/user.model";
import { resolveRouteParams } from "@/types/AppRouteContext";
import type { AppRouteContext } from "@/types/AppRouteContext";

export async function GET(
  request: NextRequest,
  context: AppRouteContext
) {
  try {
    await dbConnect();

    const params = await resolveRouteParams(context);
    const productId = typeof params?.id === "string" ? params.id : null;

    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      return NextResponse.json({ error: "Invalid Product ID" }, { status: 400 });
    }

    const product = await ProductModel.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const serialized = {
      ...product.toObject(),
      _id: String(product._id),
      sellerId: String(product.sellerId),
    };

    return NextResponse.json({ product: serialized });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: AppRouteContext
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await resolveRouteParams(context);
    const productId = typeof params?.id === "string" ? params.id : null;

    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      return NextResponse.json({ error: "Invalid Product ID" }, { status: 400 });
    }

    const product = await ProductModel.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!session.user.email) {
      return NextResponse.json({ error: "Email is missing in session" }, { status: 400 });
    }
    const user = await UserModel.getByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (product.sellerId.toString() !== (user._id as string).toString()) {
      return NextResponse.json({ error: "You can only delete your own products" }, { status: 403 });
    }

    await ProductModel.findByIdAndDelete(productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: AppRouteContext
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "seller") {
      return NextResponse.json({ error: "Only sellers can edit products" }, { status: 403 });
    }

    const params = await resolveRouteParams(context);
    const productId = typeof params?.id === "string" ? params.id : null;

    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      return NextResponse.json({ error: "Invalid Product ID" }, { status: 400 });
    }

    const product = await ProductModel.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.sellerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own products" }, { status: 403 });
    }

    const payload = await request.json();

    const requiredFields = [
      "title",
      "description",
      "price",
      "category",
      "condition",
      "quantity",
      "unit",
      "location",
    ];

    for (const field of requiredFields) {
      if (payload[field] === undefined || payload[field] === "" || payload[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const price = typeof payload.price === "string" ? Number(payload.price) : payload.price;
    const quantity = typeof payload.quantity === "string" ? Number(payload.quantity) : payload.quantity;
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
    }

    if (Number.isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number" }, { status: 400 });
    }

    const location = payload.location;
    if (
      !location ||
      !location.city ||
      !location.state ||
      !location.country
    ) {
      return NextResponse.json({ error: "Complete location is required" }, { status: 400 });
    }

    product.title = String(payload.title).trim();
    product.description = String(payload.description).trim();
    product.category = String(payload.category).trim();
    product.condition = String(payload.condition).trim();
    product.unit = String(payload.unit).trim();
    product.price = price;
    product.quantity = quantity;
    product.negotiable = Boolean(payload.negotiable);
    product.location = {
      city: String(location.city).trim(),
      state: String(location.state).trim(),
      country: String(location.country).trim(),
    };

    await product.save();

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}