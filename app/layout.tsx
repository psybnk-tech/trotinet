import type { Metadata } from "next";
import "./globals.css";
import "./storefront.css";
import "./storefront-enhancements.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: "سكوتر بييس | قطع غيار التروتينيت",
  description:
    "قلب على قطع غيار التروتينيت الكهربائية، وشوف التفاصيل، وسول على التوفر ديالها.",
  openGraph: {
    title: "سكوتر بييس | قطع غيار التروتينيت",
    description: "كتالوگ ديال قطع غيار التروتينيت الكهربائية.",
    locale: "ar_MA",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ary" dir="rtl">
      <body>{children}</body>
    </html>
  );
}