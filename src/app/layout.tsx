import type { Metadata, Viewport } from "next";
import { Albert_Sans, Imbue } from "next/font/google";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const albert = Albert_Sans({
  variable: "--font-albert",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const imbue = Imbue({
  variable: "--font-imbue",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${BRAND.nome} · Lista de presentes no Pix`, template: `%s · ${BRAND.nome}` },
  description: BRAND.frase,
};

export const viewport: Viewport = {
  themeColor: "#e8e8e3",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${albert.variable} ${imbue.variable} antialiased`}>{children}</body>
    </html>
  );
}
