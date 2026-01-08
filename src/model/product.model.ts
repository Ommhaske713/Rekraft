import mongoose, { Schema, Document, Model } from "mongoose";

interface ProductLocation {
  city: string;
  state: string;
  country: string;
}

export interface Product extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  quantity: number;
  unit: string;
  negotiable: boolean;
  images: string[];
  location: ProductLocation;
  sellerId: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<Product>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    category: { 
      type: String, 
      required: true,
      enum: ["bricks", "doors", "windows", "metals", "wood", "tiles", "plumbing", "electrical", "carpentry", "other"]
    },
    condition: { 
      type: String, 
      required: true,
      enum: ["new", "like_new", "good", "fair", "salvage"]
    },
    quantity: { type: Number, required: true, min: 1 },
    unit: { 
      type: String, 
      required: true,
      enum: ["piece", "kg", "sqft", "meter", "bundle", "ton", "sheet"]
    },
    negotiable: { type: Boolean, default: false },
    images: { type: [String], default: ["/product-placeholder.svg"] },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true }
    },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ "location.city": 1 });
productSchema.index({ price: 1 });
productSchema.index({ title: "text", description: "text" });

const ProductModelMongoose = mongoose.models.Product as Model<Product> || 
  mongoose.model<Product>("Product", productSchema);

export class ProductModel {
  static async create(productData: Partial<Product>): Promise<Product> {
    await mongoose.connect(process.env.MONGODB_URI!);
    return await ProductModelMongoose.create(productData);
  }

  static async findById(id: string): Promise<Product | null> {
    await mongoose.connect(process.env.MONGODB_URI!);
    return await ProductModelMongoose.findById(id);
  }

  static async findByIdAndDelete(id: string): Promise<Product | null> {
    await mongoose.connect(process.env.MONGODB_URI!);
    return await ProductModelMongoose.findByIdAndDelete(id);
  }

  static async find(filters: Record<string, unknown> = {}, projection?: Record<string, unknown>): Promise<Product[]> {
    await mongoose.connect(process.env.MONGODB_URI!);
    return await ProductModelMongoose.find(filters, projection).sort({ createdAt: -1 });
  }

  static async getSellerProducts(sellerId: string): Promise<Product[]> {
    await mongoose.connect(process.env.MONGODB_URI!);
    return await ProductModelMongoose.find({ sellerId }).sort({ createdAt: -1 });
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    await mongoose.connect(process.env.MONGODB_URI!);
    return await ProductModelMongoose.find({ category }).sort({ createdAt: -1 });
  }

  static async searchProducts(query: string): Promise<Product[]> {
    await mongoose.connect(process.env.MONGODB_URI!);
    return await ProductModelMongoose.find({ 
      $text: { $search: query } 
    }).sort({ score: { $meta: "textScore" } });
  }
}