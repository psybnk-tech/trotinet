import { NextResponse } from "next/server";
import { consumeRateLimit, requireSameOrigin, startAdminSession, verifyAdminPassword } from "@/lib/security";

export async function POST(request: Request) {
  const destination = new URL("/admin", request.url);
  try {
    await requireSameOrigin(request);
    if (!(await consumeRateLimit("admin-login", request, 5, 900))) {
      destination.searchParams.set("error", "wait");
      return NextResponse.redirect(destination, 303);
    }
    const form = await request.formData();
    const email = String(form.get("email") ?? "").slice(0, 254);
    const password = String(form.get("password") ?? "").slice(0, 200);
    if (!(await verifyAdminPassword(email, password))) {
      destination.searchParams.set("error", "invalid");
      return NextResponse.redirect(destination, 303);
    }
    await startAdminSession(email.trim().toLowerCase());
    destination.searchParams.set("signedIn", "1");
    return NextResponse.redirect(destination, 303);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ORIGIN") return new NextResponse("Forbidden", { status: 403 });
    console.error("Admin sign-in failed.");
    destination.searchParams.set("error", "setup");
    return NextResponse.redirect(destination, 303);
  }
}