import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [products, categories, settings] = await Promise.all([
      db.product.findMany({
        where: { published: true, archivedAt: null },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 100,
        include: { category: true, images: { orderBy: { position: "asc" }, take: 1 }, specifications: { orderBy: { position: "asc" } }, compatibility: { where: { verified: true }, select: { model: true } } },
      }),
      db.category.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { nameAr: "asc" }], select: { id: true, nameAr: true, nameFr: true, slug: true } }),
      db.storeSettings.findUnique({ where: { id: "store" }, select: { businessName: true, whatsappPhone: true, showPrices: true, location: true, mapUrl: true, openingHours: true, deliveryInfo: true } }),
    ]);
    return NextResponse.json({
      products: products.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        ref: product.sku,
        brand: product.brand,
        category: product.category?.nameAr ?? "قطع متنوعة",
        price: settings?.showPrices && product.showPrice ? (product.salePrice ?? product.price)?.toString() ?? null : null,
        originalPrice: settings?.showPrices && product.showPrice && product.salePrice ? product.price?.toString() ?? null : null,
        state: product.availability === "AVAILABLE" ? "متوفرة" : product.availability === "OUT_OF_STOCK" ? "سالاو" : "سول على التوفر",
        availability: product.availability,
        description: product.description,
        specifications: product.specifications.map(({ label, value }) => ({ label, value })),
        compatibility: product.compatibility.map(({ model }) => model),
        imageUrl: product.images[0]?.url ?? null,
        isSample: false,
        color: "mint",
        shape: "custom",
        tag: product.category?.nameFr ?? "قطع الغيار",
      })),
      categories,
      settings: settings ? { ...settings, whatsappPhone: settings.whatsappPhone ?? process.env.WHATSAPP_PHONE ?? null } : { businessName: "سكوتر بييس", whatsappPhone: process.env.WHATSAPP_PHONE ?? null, showPrices: false, location: null, mapUrl: null, openingHours: null, deliveryInfo: null },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "الكتالوگ غادي يرجع قريب." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}