import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(24).regex(/^[+\d\s().-]+$/),
  message: z.string().trim().min(8).max(2000),
  productId: z.string().cuid().optional().or(z.literal("")),
  website: z.string().max(200).optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sku: z.string().trim().min(2).max(80).regex(/^[a-zA-Z0-9._-]+$/),
  categoryId: z.string().optional(),
  description: z.string().trim().max(4000).optional(),
  brand: z.string().trim().max(100).optional(),
  price: z.string().regex(/^$|^\d{1,8}(?:\.\d{1,2})?$/),
  salePrice: z.string().regex(/^$|^\d{1,8}(?:\.\d{1,2})?$/),
  availability: z.enum(["AVAILABLE", "OUT_OF_STOCK", "ASK_SELLER"]),
  published: z.boolean(),
  featured: z.boolean(),
  specifications: z.string().max(6000).optional(),
  compatibility: z.string().max(2000).optional(),
  compatibilityVerified: z.boolean(),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
});