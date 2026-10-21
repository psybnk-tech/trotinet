"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toWhatsAppDigits } from "@/lib/phone";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowUpLeft,
  BatteryCharging,
  Bike,
  Cable,
  ChevronDown,
  CircleHelp,
  CheckCircle2,
  Disc3,
  Filter,
  Gauge,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

const categories = [
  { name: "العجلات والعجلات الداخلية", french: "Pneus & chambres", icon: Disc3 },
  { name: "الشواحن والبطاريات", french: "Chargeurs & batteries", icon: BatteryCharging },
  { name: "الفرانات", french: "Freinage", icon: CircleHelp },
  { name: "الكابلات والكونكتورات", french: "Câbles & connecteurs", icon: Cable },
  { name: "الموتورات والكنترولورات", french: "Moteurs & contrôleurs", icon: Zap },
  { name: "الإكسسوارات", french: "Accessoires", icon: Gauge },
];

type Product = { id: string; slug?: string; name: string; ref: string; brand?: string | null; category: string; price: string | null; originalPrice?: string | null; state: string; availability?: string; description?: string | null; specifications?: Array<{ label: string; value: string }>; compatibility?: string[]; imageUrl?: string | null; isSample?: boolean; shape: string; color: string; tag: string };

const sampleProducts: Product[] = [
  { id: "1", name: "Pneu 8.5 pouces", ref: "EXEMPLE-PN-085", category: "العجلات والعجلات الداخلية", price: null, state: "سول على التوفر", shape: "tire", color: "mint", tag: "عجلات", isSample: true },
  { id: "2", name: "Chargeur trottinette", ref: "EXEMPLE-CH-001", category: "الشواحن والبطاريات", price: null, state: "سول على التوفر", shape: "charger", color: "lavender", tag: "شحن", isSample: true },
  { id: "3", name: "Plaquettes de frein", ref: "EXEMPLE-FR-002", category: "الفرانات", price: null, state: "سول على التوفر", shape: "brakes", color: "peach", tag: "فرانات", isSample: true },
  { id: "4", name: "Contrôleur électrique", ref: "EXEMPLE-CT-001", category: "الموتورات والكنترولورات", price: null, state: "سول على التوفر", shape: "controller", color: "blue", tag: "إلكترونيك", isSample: true },
  { id: "5", name: "Câble de frein", ref: "EXEMPLE-CB-001", category: "الكابلات والكونكتورات", price: null, state: "سول على التوفر", shape: "cable", color: "yellow", tag: "فرانات", isSample: true },
  { id: "6", name: "Batterie trottinette", ref: "EXEMPLE-BA-001", category: "الشواحن والبطاريات", price: null, state: "سول على التوفر", shape: "battery", color: "rose", tag: "شحن", isSample: true },
];

function ProductArt({ product }: { product: Product }) {
  const Icon = product.shape === "tire" ? Disc3 : product.shape === "charger" ? BatteryCharging : product.shape === "cable" ? Cable : product.shape === "battery" ? BatteryCharging : product.shape === "controller" ? Zap : CircleHelp;
  return (
    <div className={`product-art art-${product.color}`} aria-label="تصويرة مؤقتة، غادي تتبدل بتصويرة القطعة" role="img">
      {product.imageUrl ? <img className="product-photo" src={product.imageUrl} alt={product.name} /> : <><div className="art-orbit" /><Icon className={`art-icon art-${product.shape}`} strokeWidth={1.05} aria-hidden="true" /><span className="art-caption">تصويرة مؤقتة</span></>}
    </div>
  );
}

function ProductCard({ product, onSelect }: { product: Product; onSelect: (product: Product) => void }) {
  return (
    <article className="product-card">
      <button className="product-art-link" onClick={() => onSelect(product)} aria-label={`تفاصيل ${product.name}`}>
        <ProductArt product={product} />
      </button>
      <div className="product-copy">
        <div className="product-topline"><span>{product.tag}</span><span className="availability"><i />{product.isSample ? "مثال مؤقت" : product.state}</span></div>
        <h3><button className="product-title" onClick={() => onSelect(product)}>{product.name}</button></h3>
        <p className="product-ref" dir="ltr">Réf. {product.ref}</p>
        <div className="product-bottom"><span className="price">{product.price ? <>{product.originalPrice && <del>{product.originalPrice} MAD </del>}{product.price} MAD</> : "تاصل باش تعرف الثمن"}</span><button onClick={() => onSelect(product)} className="round-arrow" aria-label={`سول على ${product.name}`}><ArrowUpLeft size={17} /></button></div>
      </div>
    </article>
  );
}

function InquiryForm({ selectedProduct, whatsappPhone }: { selectedProduct: Product | null; whatsappPhone: string | null }) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const message = `${selectedProduct ? `القطعة: ${selectedProduct.name} (${selectedProduct.ref})\n` : ""}${String(form.get("message") ?? "")}`;
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), phone: form.get("phone"), message, productId: selectedProduct && !selectedProduct.isSample ? selectedProduct.id : undefined, website: form.get("website") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "ما قدرناش نسجلو الرسالة.");
      formElement.reset();
      setStatus("وصلاتنا رسالتك. غادي نتاصلو بيك ملي يتجهز رقم التواصل.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "ما قدرناش نسجلو الرسالة.");
    } finally {
      setSending(false);
    }
  }
  const whatsappDigits = whatsappPhone ? toWhatsAppDigits(whatsappPhone) : "";
  const whatsappMessage = encodeURIComponent(selectedProduct ? `Salam, bghit ntsawel 3la ${selectedProduct.name} (${selectedProduct.ref}).` : "Salam, bghit ntsawel 3la pièces dyal trottinette.");
  return <div className="contact-form-panel"><div className="contact-form-intro"><span className="section-kicker">تواصل معانا</span><h2>خلي لينا رسالة</h2><p>عمر المعلومات، والمرجع ديال القطعة إلا كنت محدد وحدة. غادي نتأكدو من التوفر والتوافق.</p>{selectedProduct && <p className="selected-product">القطعة المختارة: <b dir="ltr">{selectedProduct.name} · {selectedProduct.ref}</b></p>}</div><form className="inquiry-form" onSubmit={submitInquiry}><label>السمية<input name="name" autoComplete="name" minLength={2} maxLength={80} required /></label><label>رقم التليفون<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={24} required dir="ltr" placeholder="+212 ..." /></label><label className="inquiry-message">شنو محتاج؟<textarea name="message" minLength={8} maxLength={2000} required placeholder="كتب لينا السؤال وموديل التروتينيت إلا عرفتيه." /></label><label className="honeypot" aria-hidden="true">خلي هاد الخانة خاوية<input name="website" tabIndex={-1} autoComplete="off" /></label><button className="inquiry-submit" disabled={sending}>{sending ? "كنسجلو الرسالة..." : "صيفط الرسالة"} <ArrowLeft size={16} /></button><p className="inquiry-status" aria-live="polite">{status}</p>{whatsappDigits ? <a className="whatsapp-link" href={`https://wa.me/${whatsappDigits}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> سولنا على WhatsApp</a> : <span className="whatsapp-unavailable">رقم WhatsApp مازال ما تزادش من عند البائع.</span>}</form></div>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [sort, setSort] = useState("newest");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [products, setProducts] = useState(sampleProducts);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState<string | null>(null);
  const [storeLocation, setStoreLocation] = useState("");
  const [storeName, setStoreName] = useState("سكوتر بييس");
  const [pricesEnabled, setPricesEnabled] = useState(false);
  const [storeExtras, setStoreExtras] = useState({ mapUrl: "", openingHours: "", deliveryInfo: "" });
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/catalog").then(async (response) => {
      if (!response.ok) throw new Error("Catalog unavailable");
      return response.json();
    }).then((data: { products: Product[]; categories: Array<{ id: string; nameAr: string; nameFr: string | null; slug: string }>; settings: { businessName: string; showPrices: boolean; whatsappPhone: string | null; location: string | null; mapUrl: string | null; openingHours: string | null; deliveryInfo: string | null } | null }) => {
      if (!active) return;
      setProducts(data.products);
      if (data.categories.length) setCategoryOptions(data.categories.map((category) => ({ name: category.nameAr, french: category.nameFr ?? category.slug, icon: categories.find((item) => item.french === category.nameFr)?.icon ?? Gauge })));
      setWhatsappPhone(data.settings?.whatsappPhone ?? null);
      setStoreLocation(data.settings?.location ?? "");
      setStoreName(data.settings?.businessName ?? "سكوتر بييس");
      setPricesEnabled(data.settings?.showPrices ?? false);
      setStoreExtras({ mapUrl: data.settings?.mapUrl ?? "", openingHours: data.settings?.openingHours ?? "", deliveryInfo: data.settings?.deliveryInfo ?? "" });
    }).catch(() => { if (active) setProducts(sampleProducts); }).finally(() => { if (active) setCatalogLoaded(true); });
    return () => { active = false; };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const matching = products.filter((product) => {
      const matchesQuery = !normalizedQuery || `${product.name} ${product.ref} ${product.brand ?? ""} ${product.category} ${product.compatibility?.join(" ") ?? ""}`.toLocaleLowerCase().includes(normalizedQuery);
      const matchesCategory = selectedCategory === "الكل" || product.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
    if (sort === "name") matching.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    if (sort === "price") matching.sort((a, b) => (a.price ?? "999999999").localeCompare(b.price ?? "999999999", "en", { numeric: true }));
    return matching;
  }, [products, query, selectedCategory, sort]);

  return (
    <main>
      <div className="announcement"><Sparkles size={14} /><span>كتالوج القطع كيتحدّث باستمرار</span>{storeLocation && <span className="announcement-location">· {storeLocation}</span>}<a href="#pieces">قلب دابا <ArrowLeft size={13} /></a></div>
      <header className="site-header">
        <a className="brand" href="#home" aria-label={`${storeName} - الصفحة الرئيسية`}><span className="brand-mark"><Zap size={21} fill="currentColor" /></span><span className="brand-name">{storeName}<small>PIÈCES POUR TROTTINETTE</small></span></a>
        <button className="menu-toggle" aria-label={mobileMenuOpen ? "سدّ المينيو" : "حلّ المينيو"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        <nav className={mobileMenuOpen ? "main-nav open" : "main-nav"} aria-label="التنقل الرئيسي">
          <a href="#pieces" onClick={() => setMobileMenuOpen(false)}>القطع</a><a href="#categories" onClick={() => setMobileMenuOpen(false)}>الأصناف</a><a href="#how" onClick={() => setMobileMenuOpen(false)}>كيفاش تطلب</a><a href="#contact" onClick={() => setMobileMenuOpen(false)}>تاصل بينا</a>
        </nav>
        {whatsappPhone ? <a className="header-contact" href={`https://wa.me/${toWhatsAppDigits(whatsappPhone)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> سول على قطعة</a> : <a className="header-contact" href="#contact"><MessageCircle size={17} /> سول على قطعة</a>}
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span /> قطع غيار التروتينيت الكهربائية</div>
          <h1>كلشي اللي كتحتاج<br />التروتينيت ديالك، <em>فبلاصة وحدة.</em></h1>
          <p>قلب على pièce de rechange، شوف التفاصيل، وسول على التوفر والثمن.</p>
          <form className="hero-search" onSubmit={(event) => { event.preventDefault(); document.querySelector("#pieces")?.scrollIntoView({ behavior: "smooth" }); }} role="search">
            <Search size={19} aria-hidden="true" /><label className="visually-hidden" htmlFor="hero-search">قلب على قطعة</label><input id="hero-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="قلب على القطعة اللي كتقلب عليها..." /><button type="submit">قلب عليها <ArrowLeft size={17} /></button>
          </form>
          <div className="hero-meta"><span><ShieldCheck size={16} /> معلومات واضحة على كل قطعة</span><span><MessageCircle size={16} /> السؤال بلا التزام بالشراء</span></div>
        </div>
        <div className="hero-visual" aria-label="رسم توضيحي مؤقت لقطع التروتينيت" role="img">
          <div className="hero-grid" />
          <div className="hero-stamp"><span className="stamp-icon"><Bike size={22} /></span><span><b>قطع الغيار</b><small>للتروتينيت ديالك</small></span></div>
          <div className="scooter-drawing"><div className="scooter-deck" /><div className="scooter-stem" /><div className="scooter-handle" /><div className="scooter-wheel wheel-back" /><div className="scooter-wheel wheel-front" /><div className="scooter-light" /></div>
          <div className="hero-note"><span><Zap size={15} /></span><b>Trottinette électrique</b><small>رسم توضيحي، ماشي تصويرة منتوج</small></div>
          <div className="hero-number">01 <span>/</span> PIECES</div>
        </div>
        <div className="hero-side-label">PIÈCES & ACCESSOIRES <span>·</span> MAROC</div>
      </section>

      <section className="category-section section-wrap" id="categories">
        <div className="section-heading"><div><span className="section-kicker">قلب حسب الصنف</span><h2>شنو كتقلب عليه؟</h2></div><a className="text-link" href="#pieces">شوف جميع القطع <ArrowLeft size={16} /></a></div>
        <div className="category-grid">{categoryOptions.map(({ name, french, icon: Icon }, index) => <button key={name} className={`category-item category-${index % 6}`} onClick={() => { setSelectedCategory(name); document.querySelector("#pieces")?.scrollIntoView({ behavior: "smooth" }); }}><span className="category-icon"><Icon size={22} strokeWidth={1.6} /></span><span className="category-names"><b>{name}</b><small dir="ltr">{french}</small></span><ArrowUpLeft className="category-arrow" size={16} /></button>)}</div>
      </section>

      <section className="catalog-section" id="pieces">
        <div className="section-wrap">
          <div className="section-heading catalog-heading"><div><span className="section-kicker">الكتالوگ</span><h2>قطع تقدر تلقاها</h2><p>سول على التوفر والمعلومات ديال كل قطعة قبل ما تاخد قرارك.</p></div><span className="sample-notice"><i /> أمثلة مؤقتة، ماشي مخزون حقيقي</span></div>
          <div className="catalog-toolbar"><label className="catalog-search"><Search size={18} /><span className="visually-hidden">قلب فالكتالوگ</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="قلب بالاسم، الصنف، الماركة، ولا المرجع..." /></label><button className="filter-toggle" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}><Filter size={16} /> صنّف <ChevronDown size={15} /></button><label className="sort-select"><ArrowDownUp size={16} /><span className="visually-hidden">رتب القطع</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">الجديد لقديم</option><option value="name">حسب السمية</option>{pricesEnabled && <option value="price">حسب الثمن</option>}</select></label></div>
          {showFilters && <div className="filter-panel"><label htmlFor="category-filter">الصنف</label><select id="category-filter" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}><option>الكل</option>{categoryOptions.map((category) => <option key={category.name}>{category.name}</option>)}</select><button onClick={() => { setSelectedCategory("الكل"); setQuery(""); }}>مسح الفلتر</button></div>}
          {!catalogLoaded ? <div className="catalog-loading" role="status" aria-label="كنحمّلو الكتالوگ"><span /><span /><span /></div> : filteredProducts.length > 0 ? <div className="product-grid">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} onSelect={setActiveProduct} />)}</div> : <div className="empty-state"><Search size={25} /><h3>ما لقينا حتى قطعة بهاد السمية.</h3><p>جرّب تقلب بكلمة خرا، ولا اختار صنف مختلف.</p><button onClick={() => { setSelectedCategory("الكل"); setQuery(""); }}>مسح البحث</button></div>}
          <div className="catalog-footnote">{filteredProducts.some((product) => product.isSample) ? "هاد القطع أمثلة باش تورّي شكل الكتالوگ. السمية، المرجع، الثمن، التوفر والتوافق خاصهم يتأكدو من عند البائع." : "التوفر والتوافق خاصهم يتأكدو من عند البائع قبل الطلب."}</div>
        </div>
      </section>

      <section className="how-section section-wrap" id="how"><div className="how-aside"><span className="section-kicker">بلا تعقيد</span><h2>من السؤال<br />حتى للقطعة.</h2><p>ما كاينش شراء مباشر من الموقع. سولنا، أكد المعلومات، ومن بعد قرر.</p></div><div className="how-steps"><div className="how-step"><span>01</span><div><h3>قلب على القطعة</h3><p>استعمل البحث ولا اختار الصنف اللي محتاج.</p></div></div><div className="how-step"><span>02</span><div><h3>سول على التفاصيل</h3><p>عطينا موديل التروتينيت ديالك باش نراجعو التوافق.</p></div></div><div className="how-step"><span>03</span><div><h3>تأكد قبل ما تاخد</h3><p>الثمن، التوفر والتوافق كيتأكدو معاك قبل أي اتفاق.</p></div></div></div></section>

      <section className="contact-band" id="contact"><div className="contact-band-inner"><div className="contact-icon"><MessageCircle size={25} /></div><div><span>ما لقيتيش اللي كتقلب عليه؟</span><h2>سولنا، يمكن نلقاوها ليك.</h2></div>{whatsappPhone ? <a className="contact-cta" href={`https://wa.me/${toWhatsAppDigits(whatsappPhone)}`} target="_blank" rel="noopener noreferrer">سولنا على WhatsApp <MessageCircle size={16} /></a> : <span className="contact-cta contact-unavailable">رقم WhatsApp مازال ما تزادش <MessageCircle size={16} /></span>}</div></section>
      <section className="contact-form-section section-wrap" id="contact-form"><InquiryForm selectedProduct={selectedProduct} whatsappPhone={whatsappPhone} /></section>

      {activeProduct && <div className="product-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveProduct(null); }}><section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="detail-close" onClick={() => setActiveProduct(null)} aria-label="سد التفاصيل"><X size={20} /></button><ProductArt product={activeProduct} /><div className="detail-copy"><span className="section-kicker">{activeProduct.category}</span><h2 id="detail-title">{activeProduct.name}</h2><p className="product-ref" dir="ltr">Réf. {activeProduct.ref}</p><div className="detail-price">{activeProduct.price ? <>{activeProduct.originalPrice && <del>{activeProduct.originalPrice} MAD </del>}{activeProduct.price} MAD</> : "تاصل باش تعرف الثمن"}</div><p>{activeProduct.description || "الوصف التقني مازال ما تزادش."}</p><dl><div><dt>التوفر</dt><dd>{activeProduct.isSample ? "غير محدد، سول البائع" : activeProduct.state}</dd></div><div><dt>التوافق</dt><dd>مازال ما تأكدش، خاص يتراجع مع موديل trottinette ديالك.</dd></div><div><dt>المواصفات</dt><dd>ما تزادتش معلومات تقنية على هاد القطعة.</dd></div></dl>{activeProduct.slug && <Link className="detail-page-link" href={`/parts/${encodeURIComponent(activeProduct.slug)}`}>الصفحة الكاملة ديال القطعة <ArrowUpLeft size={15} /></Link>}<button className="detail-inquiry" onClick={() => { setSelectedProduct(activeProduct); setActiveProduct(null); window.setTimeout(() => document.querySelector("#contact-form")?.scrollIntoView({ behavior: "smooth" }), 0); }}>سول على هاد القطعة <ArrowLeft size={16} /></button></div></section></div>}

      <footer className="site-footer"><div className="footer-main"><a className="brand footer-brand" href="#home"><span className="brand-mark"><Zap size={21} fill="currentColor" /></span><span className="brand-name">{storeName}<small>PIÈCES POUR TROTTINETTE</small></span></a><div className="footer-information"><p>كتالوگ ديال قطع غيار التروتينيت الكهربائية. كل المعلومات التجارية كتحتاج تأكيد من عند البائع.</p>{storeLocation && <span>{storeExtras.mapUrl ? <a href={storeExtras.mapUrl} target="_blank" rel="noopener noreferrer">{storeLocation} · شوف الخريطة</a> : storeLocation}</span>}{storeExtras.openingHours && <span>أوقات العمل: {storeExtras.openingHours}</span>}{storeExtras.deliveryInfo && <span>التوصيل: {storeExtras.deliveryInfo}</span>}</div><a href="#contact" className="footer-question"><MessageCircle size={16} /> تاصل بينا</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {storeName}</span><span>كتالوگ معلوماتي، ماشي متجر بيع مباشر</span><a href="#home">طلع للفوق ↑</a></div></footer>
    </main>
  );
}