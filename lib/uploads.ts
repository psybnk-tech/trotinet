import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const imageTypes = {
  "image/jpeg": { extension: "jpg", matches: (bytes: Buffer) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/png": { extension: "png", matches: (bytes: Buffer) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/webp": { extension: "webp", matches: (bytes: Buffer) => bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" },
} as const;

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_IMAGES = 8;

export async function saveProductImages(files: File[], altText: string, startPosition: number) {
  if (files.length > MAX_PRODUCT_IMAGES || files.some((file) => file.size > MAX_PRODUCT_IMAGE_BYTES || file.size === 0)) {
    throw new Error("INVALID_IMAGE_SIZE");
  }
  const directory = path.join(process.cwd(), "uploads");
  await mkdir(directory, { recursive: true, mode: 0o750 });
  const images: Array<{ url: string; altText: string; position: number }> = [];
  for (const [index, file] of files.entries()) {
    const type = imageTypes[file.type as keyof typeof imageTypes];
    if (!type) throw new Error("INVALID_IMAGE_TYPE");
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!type.matches(bytes)) throw new Error("INVALID_IMAGE_CONTENT");
    const filename = `${randomUUID()}.${type.extension}`;
    await writeFile(path.join(directory, filename), bytes, { flag: "wx", mode: 0o640 });
    images.push({ url: `/api/images/${filename}`, altText: altText.slice(0, 180), position: startPosition + index });
  }
  return images;
}