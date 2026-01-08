import { z } from "zod";

export const baseUserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const customerSchema = baseUserSchema.extend({
  role: z.literal("customer"),
  savedProducts: z.array(z.string()).optional(),
  cart: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).optional(),
  orderHistory: z.array(z.string()).optional(),
});

export const sellerSchema = baseUserSchema.extend({
  role: z.literal("seller"),
  businessName: z.string(),
  businessDescription: z.string().optional(),
  taxId: z.string().optional(),
  verificationStatus: z.enum(["pending", "verified", "rejected"]).default("pending"),
  rating: z.number().min(0).max(5).optional(),
  productListings: z.array(z.string()).optional(),
  salesHistory: z.array(z.string()).optional(),
});

export type BaseUser = z.infer<typeof baseUserSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type Seller = z.infer<typeof sellerSchema>;
