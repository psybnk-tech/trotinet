import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireAdmin, requireSameOrigin } from "@/lib/security";
import { MAX_PRODUCT_IMAGE_BYTES, MAX_PRODUCT_IMAGES, saveProductImages } from "@/lib/uploads";
import { productSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireSameOrigin(request);
    await requireAdmin();
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_PRODUCT_IMAGES * MAX_PRODUCT_IMAGE_BYTES + 1024 * 1024) return new NextResponse("Uploads are too large", { status: 413 });
    const form = await request.formData();
    const action = String(form.get("action") ?? "create");
    const id = String(form.get("id") ?? "");
    if (action === "toggle" || action === "archive") {
      if (!id) return NextResponse.json({ error: "المنتج ما تلقاش." }, { status: 400 });
      const product = await db.product.findUnique({ where: { id }, select: { id: true, published: true, archivedAt: true } });
      if (!product) return NextResponse.json({ error: "المنتج ما تلقاش." }, { status: 404 });
      await db.$transaction([
        db.product.update({ where: { id }, data: action === "archive" ? { archivedAt: new Date(), published: false } : { published: !product.published } }),
        db.auditEvent.create({ data: { action: action === "archive" ? "product.archive" : "product.publish_toggle", entity: "Product", entityId: id } }),
      ]);
      return NextResponse.redirect(new URL("/admin?updated=1", request.url), 303);
    }
    const parsed = productSchema.safeParse({
      name: form.get("name"), slug: form.get("slug"), sku: form.get("sku"),
      categoryId: String(form.get("categoryId") ?? ""), description: form.get("description") ?? "",
      brand: String(form.get("brand") ?? ""),
      price: String(form.get("price") ?? ""), salePrice: String(form.get("salePrice") ?? ""),
      availability: form.get("availability"), published: form.get("published") === "on",
      featured: form.get("featured") === "on",
      specifications: String(form.get("specifications") ?? ""),
      compatibility: String(form.get("compatibility") ?? ""), compatibilityVerified: form.get("compatibilityVerified") === "on",
      seoTitle: String(form.get("seoTitle") ?? ""), seoDescription: String(form.get("seoDescription") ?? ""),
    });
    if (!parsed.success) return NextResponse.json({ error: "راجع الحقول: السمية، الرابط، المرجع والثمن." }, { status: 400 });
    const values = parsed.data;
    if (values.salePrice && (!values.price || new Prisma.Decimal(values.salePrice).greaterThan(new Prisma.Decimal(values.price)))) return NextResponse.json({ error: "ثمن التخفيض خاصو يكون أقل من الثمن الأصلي." }, { status: 400 });
    const specifications = (values.specifications ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 30).map((line) => {
      const separator = line.indexOf("|");
      return separator > 0 && separator < line.length - 1 ? { label: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() } : null;
    });
    const compatibility = (values.compatibility ?? "").split(/\r?\n/).map((model) => model.trim()).filter(Boolean).slice(0, 20).map((model) => ({ model, brand: values.brand || null, verified: values.compatibilityVerified }));
    if (specifications.some((specification) => !specification?.label || !specification.value || specification.label.length > 100 || specification.value.length > 200) || compatibility.some((item) => item.model.length > 120)) return NextResponse.json({ error: "راجع المواصفات: كل سطر خاصو يكون بالصيغة الاسم | القيمة." }, { status: 400 });
    const validSpecifications = specifications.filter((specification): specification is { label: string; value: string } => Boolean(specification));
    const data = {
      name: values.name, slug: values.slug, sku: values.sku.toUpperCase(),
      categoryId: values.categoryId || null, description: values.description || null, brand: values.brand || null,
      price: values.price ? new Prisma.Decimal(values.price) : null,
      salePrice: values.salePrice ? new Prisma.Decimal(values.salePrice) : null,
      showPrice: Boolean(values.price), availability: values.availability,
      published: values.published, featured: values.featured,
      seoTitle: values.seoTitle || null, seoDescription: values.seoDescription || null,
    };
    const files = form.getAll("images").filter((file): file is File => file instanceof File && file.size > 0);
    if (files.length > MAX_PRODUCT_IMAGES || files.some((file) => file.size > MAX_PRODUCT_IMAGE_BYTES)) return new NextResponse("Use up to 8 images, each no larger than 5 MB.", { status: 400 });
    if (action === "update") {
      if (!id) return new NextResponse("Missing product ID", { status: 400 });
      const existingImages = await db.productImage.count({ where: { productId: id } });
      const images = await saveProductImages(files, values.name, existingImages);
      await db.$transaction(async (transaction) => {
        await transaction.product.update({ where: { id, archivedAt: null }, data });
        await transaction.productSpec.deleteMany({ where: { productId: id } });
        await transaction.compatibility.deleteMany({ where: { productId: id } });
        if (validSpecifications.length) await transaction.productSpec.createMany({ data: validSpecifications.map((specification, position) => ({ ...specification, productId: id, position })) });
        if (compatibility.length) await transaction.compatibility.createMany({ data: compatibility.map((item) => ({ ...item, productId: id })) });
        if (images.length) await transaction.productImage.createMany({ data: images.map((image) => ({ ...image, productId: id })) });
        await transaction.auditEvent.create({ data: { action: "product.update", entity: "Product", entityId: id } });
      });
      return NextResponse.redirect(new URL("/admin?updated=product#products", request.url), 303);
    }
    const product = await db.product.create({ data });
    const images = await saveProductImages(files, values.name, 0);
    await db.$transaction([
      ...(validSpecifications.length ? [db.productSpec.createMany({ data: validSpecifications.map((specification, position) => ({ ...specification, productId: product.id, position })) })] : []),
      ...(compatibility.length ? [db.compatibility.createMany({ data: compatibility.map((item) => ({ ...item, productId: product.id })) })] : []),
      ...(images.length ? [db.productImage.createMany({ data: images.map((image) => ({ ...image, productId: product.id })) })] : []),
      db.auditEvent.create({ data: { action: "product.create", entity: "Product", entityId: product.id } }),
    ]);
    return NextResponse.redirect(new URL("/admin?created=product#products", request.url), 303);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
    if (error instanceof Error && error.message === "INVALID_ORIGIN") return new NextResponse("Forbidden", { status: 403 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "المرجع ولا الرابط راه مستعمل من قبل." }, { status: 409 });
    }
    if (error instanceof Error && ["INVALID_IMAGE_SIZE", "INVALID_IMAGE_TYPE", "INVALID_IMAGE_CONTENT"].includes(error.message)) {
      return NextResponse.json({ error: "الصور خاصها تكون JPG أو PNG أو WebP، الحجم أقل من 5 MB للصورة." }, { status: 400 });
    }
    console.error("Product management request failed.");
    return NextResponse.json({ error: "ما قدرناش نحفظو التغيير." }, { status: 500 });
  }
}