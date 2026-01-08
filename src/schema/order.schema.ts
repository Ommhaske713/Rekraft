import { z } from "zod";

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned"
]);

export const orderItemSchema = z.object({
  productId: z.string(),
  title: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
});

export const orderSchema = z.object({
  id: z.string().uuid().optional(),
  customerId: z.string(),
  sellerId: z.string(),
  items: z.array(orderItemSchema),
  status: orderStatusSchema.default("pending"),
  totalAmount: z.number().positive(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  paymentMethod: z.string(),
  paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending"),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const negotiationSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string(),
  customerId: z.string(),
  sellerId: z.string(),
  initialPrice: z.number().positive(),
  counterOffer: z.number().positive().optional(),
  status: z.enum(["pending", "accepted", "rejected", "countered"]).default("pending"),
  messages: z.array(z.object({
    userId: z.string(),
    message: z.string(),
    timestamp: z.date(),
  })).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Negotiation = z.infer<typeof negotiationSchema>;
