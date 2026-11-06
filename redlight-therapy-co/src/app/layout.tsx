import type { Metadata, Viewport } from "next";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/inter";
import "./globals.css";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Redlight Therapy Co. | Wholesale Red Light Therapy Devices", template: "%s | Redlight Therapy Co." },
  description:
    "Wholesale red light therapy panels, LED face masks and hair caps for distributors, retailers, clinics and salons. Apply for a trade account or send a bulk enquiry.",
  openGraph: { type: "website", siteName: "Redlight Therapy Co.", locale: "en_GB", images: [{ url: "/images/products/300-led-panel.webp", width: 900, height: 900 }] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#faf8f6", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
