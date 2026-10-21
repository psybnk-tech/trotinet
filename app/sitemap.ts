import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  let products: Array<{ slug: string; updatedAt: Date }> = [];
  try {
    products = await db.product.findMany({ where: { published: true, archivedAt: null }, select: { slug: true, updatedAt: true } });
  } catch {
    products = [];
  }
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    ...products.map((product) => ({ url: `${baseUrl}/parts/${encodeURIComponent(product.slug)}`, lastModified: product.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}