import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import DOMPurify from 'isomorphic-dompurify';

export const baseUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(2),
  phone: z.string().min(5),
  avatar: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string()
  })
});

export const customerSchema = baseUserSchema.extend({
  role: z.literal('customer'),
  savedProducts: z.array(z.string()).optional(),
  cart: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1)
  })).optional(),
  orderHistory: z.array(z.string()).optional()
});

export const sellerSchema = baseUserSchema.extend({
  role: z.literal('seller'),
  businessName: z.string().min(2),
  businessDescription: z.string().optional(),
  taxId: z.string().optional(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']).default('pending'),
  negotiable: z.boolean().default(false),
  rating: z.number().min(0).max(5).optional(),
  productListings: z.array(z.string()).optional(),
  salesHistory: z.array(z.string()).optional()
});

interface BaseUser extends Document {
  email: string;
  password: string;
  username: string;
  phone: string;
  avatar?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  verificationCode?: string;
  verificationExpires?: Date;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer extends BaseUser {
  role: 'customer';
  savedProducts?: string[];
  cart?: Array<{
    productId: string;
    quantity: number;
  }>;
  orderHistory?: string[];
}

export interface Seller extends BaseUser {
  role: 'seller';
  businessName: string;
  businessDescription?: string;
  taxId?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  negotiable: boolean;
  rating?: number;
  productListings?: string[];
  salesHistory?: string[];
}

export type User = Customer | Seller;

const baseUserSchemaMongoose = new Schema<BaseUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: { type: String, required: true },
  username: { type: String, required: true },
  phone: { type: String, required: true },
  avatar: {
    data: { type: String },
    contentType: { type: String }
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  verificationCode: { type: String },
  verificationExpires: { type: Date },
  verified: { type: Boolean, default: false }
}, {
  timestamps: true,
  discriminatorKey: 'role',
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.verificationCode;
      return ret;
    }
  }
});

const BaseUserModel = mongoose.models.User || mongoose.model<BaseUser>('User', baseUserSchemaMongoose);

const customerSchemaMongoose = new Schema<Customer>({
  savedProducts: [{ type: String }],
  cart: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  orderHistory: [{ type: String }]
});

const sellerSchemaMongoose = new Schema<Seller>({
  businessName: { type: String, required: true },
  businessDescription: { type: String },
  taxId: { type: String },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  negotiable: { type: Boolean, default: false },
  rating: { type: Number, min: 0, max: 5 },
  productListings: [{ type: String }],
  salesHistory: [{ type: String }]
});

const CustomerModel = BaseUserModel.discriminators?.['Customer'] ||
  BaseUserModel.discriminator<Customer>('Customer', customerSchemaMongoose);

const SellerModel = BaseUserModel.discriminators?.['Seller'] ||
  BaseUserModel.discriminator<Seller>('Seller', sellerSchemaMongoose);

export class UserModel {
  static async getById(id: string): Promise<User | null> {
    await dbConnect();
    return BaseUserModel.findById(id).exec();
  }

  static async getByEmail(email: string): Promise<User | null> {
    await dbConnect();
    return BaseUserModel.findOne({ email: DOMPurify.sanitize(email.toLowerCase()) }).exec();
  }

  static async createUser(data: z.infer<typeof customerSchema | typeof sellerSchema>): Promise<User> {
    await dbConnect();
    const Model = data.role === 'customer' ? CustomerModel : SellerModel;
    const user = new Model({
      ...data,
      email: DOMPurify.sanitize(data.email.toLowerCase())
    });
    await user.save();
    return user;
  }

static async updateUser(id: string, data: Partial<Customer | Seller>): Promise<User | null> {
  await dbConnect();
  const sanitizedData = this.sanitizeInput(data);
  
  try {
    const updatedUser = await mongoose.models.User.findByIdAndUpdate(
      id,
      { $set: sanitizedData },
      { new: true }
    );
    
    console.log("User update successful:", updatedUser ? "Yes" : "No");
    if (updatedUser && 'cart' in sanitizedData) {
      console.log("Updated cart in database:", JSON.stringify(updatedUser.cart));
    }
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

  static async deleteUser(id: string): Promise<User | null> {
    await dbConnect();
    return BaseUserModel.findByIdAndDelete(id).exec();
  }

  static async getCustomerById(id: string): Promise<Customer | null> {
    await dbConnect();
    
    if (!mongoose.connection.db) {
      throw new Error("Database connection is not established");
    }
    const user = await mongoose.connection.db.collection('users').findOne({
      _id: new mongoose.Types.ObjectId(id),
      role: 'customer'
    });
    
    if (!user) return null;

    return user as unknown as Customer;
  }

  static async getSellerById(userId: string): Promise<User | null> {
    await dbConnect();
    return BaseUserModel.findOne({
      _id: userId,
      role: 'seller'
    }).exec();
  }

  static async findByVerificationCode(email: string, code: string): Promise<User | null> {
    await dbConnect();

    return BaseUserModel.findOne({
      email: DOMPurify.sanitize(email.toLowerCase()),
      verificationCode: code,
      verificationExpires: { $gt: new Date() } 
    }).exec();
  }

  static async verifyUser(userId: string): Promise<User | null> {
    await dbConnect();

    return BaseUserModel.findByIdAndUpdate(
      userId,
      {
        verified: true,
        $unset: { verificationCode: 1, verificationExpires: 1 }
      },
      { new: true }
    ).exec();
  }

  private static sanitizeInput<T extends object>(data: T): T {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key as keyof T] = DOMPurify.sanitize(value) as T[keyof T];
      } else {
        acc[key as keyof T] = value as T[keyof T];
      }
      return acc;
    }, {} as T);
  }
}

export default BaseUserModel;