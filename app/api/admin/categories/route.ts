import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, requireSameOrigin } from "@/lib/security";

const categorySchema = z.object({
  nameAr: z.string().trim().min(2).max(100),
  nameFr: z.string().trim().max(100).optional(),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export async function POST(request: Request) {
  try {
    await requireSameOrigin(request);
    await requireAdmin();
    const form = await request.formData();
    const action = String(form.get("action") ?? "create");
    const id = String(form.get("id") ?? "");
    if (action === "toggle" && id) {
      const category = await db.category.findUnique({ where: { id }, select: { active: true } });
      if (!category) return new NextResponse("Not found", { status: 404 });
      await db.$transaction([
        db.category.update({ where: { id }, data: { active: !category.active } }),
        db.auditEvent.create({ data: { action: "category.toggle", entity: "Category", entityId: id } }),
      ]);
      return NextResponse.redirect(new URL("/admin?updated=1", request.url), 303);
    }
    const parsed = categorySchema.safeParse({ nameAr: form.get("nameAr"), nameFr: form.get("nameFr") ?? "", slug: form.get("slug") });
    if (!parsed.success) return NextResponse.json({ error: "راجع معلومات الصنف." }, { status: 400 });
    if (action === "update") {
      if (!id) return new NextResponse("Missing category ID", { status: 400 });
      await db.$transaction([
        db.category.update({ where: { id }, data: { ...parsed.data, nameFr: parsed.data.nameFr || null } }),
        db.auditEvent.create({ data: { action: "category.update", entity: "Category", entityId: id } }),
      ]);
      return NextResponse.redirect(new URL("/admin?updated=category#categories", request.url), 303);
    }
    const category = await db.category.create({ data: { ...parsed.data, nameFr: parsed.data.nameFr || null } });
    await db.auditEvent.create({ data: { action: "category.create", entity: "Category", entityId: category.id } });
    return NextResponse.redirect(new URL("/admin?created=category", request.url), 303);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
    if (error instanceof Error && error.message === "INVALID_ORIGIN") return new NextResponse("Forbidden", { status: 403 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "هاد الرابط مستعمل من قبل." }, { status: 409 });
    console.error("Category management request failed.");
    return NextResponse.json({ error: "ما قدرناش نحفظو التغيير." }, { status: 500 });
  }
}