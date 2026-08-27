import type { Metadata, Viewport } from "next";
import { Archivo_Black, Inter, Unbounded } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  weight: "700",
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
      className={`${archivoBlack.variable} ${inter.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] font-[family-name:var(--font-body)]">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
