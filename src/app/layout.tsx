import type { Metadata, Viewport } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  weight: "400",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ápex",
  description: "Tu cordada de entrenamiento",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ápex",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#211d1a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${caprasimo.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] font-[family-name:var(--font-body)]">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
