import { z } from "zod";

export const materialCategorySchema = z.enum([
  "bricks",
  "doors",
  "windows",
  "metals",
  "wood",
  "tiles",
  "plumbing",
  "electrical",
  "carpentry",
  "other"
]);

export const productConditionSchema = z.enum([
  "new",
  "like_new",
  "good",
  "fair",
  "salvage"
]);

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  sellerId: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: materialCategorySchema,
  condition: productConditionSchema,
  quantity: z.number().int().positive(),
  unit: z.string(),
  price: z.number().positive(),
  negotiable: z.boolean().default(false),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  location: z.object({
    city: z.string(),
    state: z.string(),
    country: z.string(),
  }),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
  }).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const productSearchParamsSchema = z.object({
  category: materialCategorySchema.optional(),
  condition: productConditionSchema.optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  location: z.string().optional(),
  query: z.string().optional(),
});

export type Product = z.infer<typeof productSchema>;
export type MaterialCategory = z.infer<typeof materialCategorySchema>;
export type ProductCondition = z.infer<typeof productConditionSchema>;
export type ProductSearchParams = z.infer<typeof productSearchParamsSchema>;
