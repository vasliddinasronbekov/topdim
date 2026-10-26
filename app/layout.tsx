import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Topdim! — kampusda yo‘qolgan va topilgan",
    template: "%s · Topdim!",
  },
  description:
    "Universitetlarda yo‘qolgan va topilgan buyumlarni e’lon, vaqt va joy bo‘yicha moslashtiruvchi platforma.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="grain flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
