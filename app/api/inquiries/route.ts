import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeRateLimit, requireSameOrigin } from "@/lib/security";
import { inquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireSameOrigin(request);
    const allowed = await consumeRateLimit("inquiry", request, 5, 900);
    if (!allowed) return NextResponse.json({ error: "طلبات كثيرة. حاول من بعد شوية." }, { status: 429 });
    const parsed = inquirySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "راجع المعلومات اللي دخلتي." }, { status: 400 });
    if (parsed.data.website) return NextResponse.json({ ok: true }, { status: 201 });
    const productId = parsed.data.productId || undefined;
    if (productId) {
      const product = await db.product.findFirst({ where: { id: productId, published: true, archivedAt: null }, select: { id: true } });
      if (!product) return NextResponse.json({ error: "القطعة ما بقاتش متاحة." }, { status: 404 });
    }
    const secret = process.env.SESSION_SECRET;
    if (!secret || Buffer.byteLength(secret) < 32) throw new Error("SESSION_SECRET is not configured.");
    const clientAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const inquiry = await db.inquiry.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        message: parsed.data.message,
        productId,
        ipHash: createHmac("sha256", secret).update(clientAddress).digest("hex"),
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ORIGIN") return NextResponse.json({ error: "الطلب مرفوض." }, { status: 403 });
    console.error("Inquiry submission failed.");
    return NextResponse.json({ error: "ما قدرناش نسجلو الرسالة. حاول من بعد." }, { status: 503 });
  }
}