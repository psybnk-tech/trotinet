import { NextResponse } from "next/server";
import { endAdminSession, requireSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  try {
    await requireSameOrigin(request);
    await endAdminSession();
    return NextResponse.redirect(new URL("/admin?logout=1", request.url), 303);
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }
}