import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, requireSameOrigin } from "@/lib/security";

const updateSchema = z.object({ id: z.string().cuid(), status: z.enum(["NEW", "CONTACTED", "RESOLVED", "SPAM"]) });

export async function POST(request: Request) {
  try {
    await requireSameOrigin(request);
    await requireAdmin();
    const form = await request.formData();
    const parsed = updateSchema.safeParse({ id: form.get("id"), status: form.get("status") });
    if (!parsed.success) return new NextResponse("Invalid inquiry status", { status: 400 });
    await db.$transaction([
      db.inquiry.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status, resolvedAt: parsed.data.status === "RESOLVED" ? new Date() : null } }),
      db.auditEvent.create({ data: { action: "inquiry.status", entity: "Inquiry", entityId: parsed.data.id } }),
    ]);
    return NextResponse.redirect(new URL("/admin?updated=1", request.url), 303);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
    if (error instanceof Error && error.message === "INVALID_ORIGIN") return new NextResponse("Forbidden", { status: 403 });
    console.error("Inquiry status update failed.");
    return new NextResponse("Could not update inquiry", { status: 500 });
  }
}