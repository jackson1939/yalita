import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display, Lora } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { ToastContainer } from "@/components/ui";
import { BottomTabBar } from "@/components/ui/BottomTabBar";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-dm-serif" });
const lora = Lora({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: { default: "Yalita — Identidad Financiera", template: "%s · Yalita" },
  description:
    "Tu reputación es tu mayor activo. Crédito justo sin banco ni colateral para los 210M de latinos sin historial formal.",
  keywords: ["DPI", "Avalanche", "DeFi", "crédito", "Bolivia", "Latam", "Tigo Money", "zkTLS"],
  authors: [{ name: "Yalita Team" }],
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
  openGraph: {
    title: "Yalita — Tu reputación es tu mayor activo",
    description: "Crédito justo para los 210M de latinos sin historial bancario.",
    type: "website",
    locale: "es_BO",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  themeColor: "#1E2235",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Theme init — must run before hydration to avoid flash */}
        <script dangerouslySetInnerHTML={{__html: `
          try {
            var t = localStorage.getItem('yalita-theme') || 'light';
            document.documentElement.setAttribute('data-theme', t);
          } catch(e) {}
        `}} />
        {/* PWA meta — mobile-web-app-capable reemplaza el deprecado apple-mobile-web-app-capable */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Yalita" />
      </head>
      <body className={`${jakarta.variable} ${dmSerif.variable} ${lora.variable} font-sans antialiased min-h-screen max-w-[430px] mx-auto relative shadow-2xl overflow-x-hidden`}
        style={{ backgroundColor: "var(--y-bg)", color: "var(--y-text-primary)" }}
      >
        <Providers>
          <div className="pb-16 min-h-screen">
            {children}
          </div>
          <BottomTabBar />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
