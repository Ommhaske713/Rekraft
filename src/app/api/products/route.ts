import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { ProductModel } from "@/model/product.model";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/user.model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    const sellerId = searchParams.get('sellerId');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const location = searchParams.get('location');
    const query = searchParams.get('query');

    const filters: Record<string, unknown> = {};
    
    if (category) filters.category = category;
    if (condition) filters.condition = condition;
    if (sellerId) filters.sellerId = sellerId;
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceObj: Record<string, number> = {};
      if (minPrice !== undefined) priceObj.$gte = minPrice;
      if (maxPrice !== undefined) priceObj.$lte = maxPrice;
      filters.price = priceObj;
    }
    const andConditions: Record<string, unknown>[] = []
    if (location) {
      const locationRegex = { $regex: location, $options: "i" }
      andConditions.push({
        $or: [
          { "location.city": locationRegex },
          { "location.state": locationRegex },
          { "location.country": locationRegex }
        ]
      })
    }
    if (query) {
      const queryRegex = { $regex: query, $options: "i" }
      andConditions.push({
        $or: [
          { title: queryRegex },
          { description: queryRegex }
        ]
      })
    }

    if (andConditions.length) {
      filters.$and = andConditions
    }
    const products = await ProductModel.find(filters);
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email as string;
    const user = await UserModel.getByEmail(email) as { _id: string; role: string };
    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Only sellers can create products" }, { status: 403 });
    }

    const productData = await request.json();

    productData.sellerId = user._id.toString();

    const requiredFields = ["title", "description", "category", "condition", "quantity", "unit"];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    if (typeof productData.price !== "number" && productData.price !== 0) {
      return NextResponse.json({ error: "Price must be a number" }, { status: 400 });
    }
    
    if (typeof productData.quantity !== "number" || productData.quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number" }, { status: 400 });
    }

    const product = await ProductModel.create(productData);
    
    return NextResponse.json({ 
      success: true, 
      product 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}