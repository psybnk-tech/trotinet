import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, requireSameOrigin } from "@/lib/security";

const settingsSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  whatsappPhone: z.string().trim().max(24).regex(/^$|^[+\d\s().-]{7,24}$/),
  contactPhone: z.string().trim().max(24).regex(/^$|^[+\d\s().-]{7,24}$/),
  contactEmail: z.union([z.literal(""), z.email()]).transform((value) => value || null),
  location: z.string().trim().max(200),
  mapUrl: z.union([z.literal(""), z.url().refine((value) => value.startsWith("https://"))]),
  openingHours: z.string().trim().max(300),
  deliveryInfo: z.string().trim().max(500),
  showPrices: z.boolean(),
});

export async function POST(request: Request) {
  try {
    await requireSameOrigin(request);
    await requireAdmin();
    const form = await request.formData();
    const parsed = settingsSchema.safeParse({
      ...Object.fromEntries(["businessName", "whatsappPhone", "contactPhone", "contactEmail", "location", "mapUrl", "openingHours", "deliveryInfo"].map((key) => [key, String(form.get(key) ?? "")])),
      showPrices: form.get("showPrices") === "on",
    });
    if (!parsed.success) return new NextResponse("راجع معلومات التواصل.", { status: 400 });
    await db.$transaction([
      db.storeSettings.upsert({ where: { id: "store" }, create: { id: "store", ...parsed.data, location: parsed.data.location || null, mapUrl: parsed.data.mapUrl || null, openingHours: parsed.data.openingHours || null, deliveryInfo: parsed.data.deliveryInfo || null, whatsappPhone: parsed.data.whatsappPhone || null, contactPhone: parsed.data.contactPhone || null }, update: { ...parsed.data, location: parsed.data.location || null, mapUrl: parsed.data.mapUrl || null, openingHours: parsed.data.openingHours || null, deliveryInfo: parsed.data.deliveryInfo || null, whatsappPhone: parsed.data.whatsappPhone || null, contactPhone: parsed.data.contactPhone || null } }),
      db.auditEvent.create({ data: { action: "settings.update", entity: "StoreSettings", entityId: "store" } }),
    ]);
    return NextResponse.redirect(new URL("/admin?updated=settings", request.url), 303);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
    if (error instanceof Error && error.message === "INVALID_ORIGIN") return new NextResponse("Forbidden", { status: 403 });
    console.error("Store settings update failed.");
    return new NextResponse("Could not save store settings", { status: 500 });
  }
}