import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { SiteHeader } from "@/app/components/SiteHeader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Sagel — Le comparateur qualité",
  description:
    "Achetez mieux, pas plus cher. Sagel analyse chaque produit — avis réels, tests experts et performance technique — pour un score unique et honnête.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        <SiteHeader />

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line mt-16">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center text-[0.78rem] text-muted">
            <p>
              <strong className="font-serif text-ink">Sagel</strong> — Scores
              calculés de façon transparente.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-2 text-muted hover:text-brand transition-colors"
            >
              Tableau de bord
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
