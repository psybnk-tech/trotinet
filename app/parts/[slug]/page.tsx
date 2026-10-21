import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { toWhatsAppDigits } from "@/lib/phone";
import "./product.css";

async function findProduct(slug: string) {
  try {
    return await db.product.findFirst({
      where: { slug, published: true, archivedAt: null },
      include: { category: true, images: { orderBy: { position: "asc" } }, specifications: { orderBy: { position: "asc" } }, compatibility: { where: { verified: true } } },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProduct(slug);
  if (!product) return { title: "القطعة ما تلقاتش | سكوتر بييس" };
  return {
    title: product.seoTitle || `${product.name} | سكوتر بييس`,
    description: product.seoDescription || product.description || `معلومات على ${product.name} من كتالوگ سكوتر بييس. تاصل باش تتأكد من التوفر والتوافق.`,
    openGraph: { title: product.seoTitle || product.name, description: product.seoDescription || product.description || "سول البائع على تفاصيل القطعة.", images: product.images[0] ? [product.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await findProduct(slug);
  if (!product) notFound();
  const settings = await db.storeSettings.findUnique({ where: { id: "store" }, select: { showPrices: true, whatsappPhone: true } }).catch(() => null);
  const related = product.categoryId ? await db.product.findMany({ where: { categoryId: product.categoryId, published: true, archivedAt: null, id: { not: product.id } }, take: 4, orderBy: { featured: "desc" }, select: { name: true, slug: true, sku: true } }).catch(() => []) : [];
  const digits = settings?.whatsappPhone || process.env.WHATSAPP_PHONE ? toWhatsAppDigits(settings?.whatsappPhone ?? process.env.WHATSAPP_PHONE!) : "";
  const inquiry = encodeURIComponent(`Salam, bghit ntsawel 3la ${product.name} (${product.sku}).`);
  const price = product.salePrice ?? product.price;
  return <main className="product-page" dir="rtl"><nav className="product-breadcrumb" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><ArrowRight size={14} /><span>{product.category?.nameAr ?? "القطع"}</span><ArrowRight size={14} /><span>{product.name}</span></nav><section className="product-detail-layout"><div className="product-gallery">{product.images.length ? product.images.map((image) => <img key={image.id} src={image.url} alt={image.altText || product.name} />) : <div className="product-image-missing">الصورة مازال ما تزادتش</div>}</div><article className="product-detail-copy"><span className="section-kicker">{product.category?.nameAr ?? "قطع متنوعة"}</span><h1>{product.name}</h1><p className="product-ref" dir="ltr">Réf. {product.sku}</p><p className="product-detail-price">{settings?.showPrices && product.showPrice && price ? <>{product.salePrice && product.price && <del>{product.price.toString()} MAD </del>}{price.toString()} MAD</> : "تاصل باش تعرف الثمن"}</p><span className={`detail-availability availability-${product.availability.toLowerCase()}`}>{product.availability === "AVAILABLE" ? "متوفرة حسب آخر تحديث" : product.availability === "OUT_OF_STOCK" ? "سالاو حسب آخر تحديث" : "سول على التوفر"}</span><p>{product.description || "الوصف التقني مازال ما تزادش."}</p><section><h2>المعلومات التقنية</h2>{product.specifications.length ? <dl>{product.specifications.map((specification) => <div key={specification.id}><dt>{specification.label}</dt><dd>{specification.value}</dd></div>)}</dl> : <p>ما تزادتش مواصفات تقنية على هاد القطعة.</p>}</section><section><h2>التوافق</h2>{product.compatibility.length ? <ul>{product.compatibility.map((item) => <li key={item.id}>{item.brand ? `${item.brand} · ` : ""}{item.model}</li>)}</ul> : <p>التوافق مازال ما تأكدش. عطينا موديل التروتينيت باش نراجعوه.</p>}</section>{digits ? <a className="product-contact-button" href={`https://wa.me/${digits}?text=${inquiry}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> سول على هاد القطعة</a> : <p className="product-contact-missing">رقم WhatsApp ديال البائع مازال ما تزادش.</p>}</article></section>{related.length > 0 && <section className="related-products"><h2>قطع من نفس الصنف</h2><div>{related.map((item) => <Link key={item.slug} href={`/parts/${encodeURIComponent(item.slug)}`}><b>{item.name}</b><small dir="ltr">Réf. {item.sku}</small></Link>)}</div></section>}</main>;
}