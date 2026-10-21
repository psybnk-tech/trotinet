import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const allowedFiles = new Map([["jpg", "image/jpeg"], ["png", "image/png"], ["webp", "image/webp"]]);

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const match = /^([0-9a-f-]{36})\.(jpg|png|webp)$/.exec(filename);
  if (!match) return new NextResponse("Not found", { status: 404 });
  try {
    const directory = path.join(process.cwd(), "uploads");
    const bytes = await readFile(path.join(directory, filename));
    const type = allowedFiles.get(match[2])!;
    return new NextResponse(new Uint8Array(bytes), { headers: { "Content-Type": type, "Content-Length": String(bytes.length), "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox", "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}