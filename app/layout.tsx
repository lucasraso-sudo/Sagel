import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ComparaPro — Trouvez le meilleur produit",
  description:
    "Comparez ventilateurs, rafraîchisseurs et climatiseurs avec des scores fiables et transparents.",
};

const NAV_LINKS = [
  { label: "Ventilateurs", href: "/category/ventilateurs" },
  { label: "Rafraîchisseurs", href: "/category/rafraichisseurs-air" },
  { label: "Climatiseurs", href: "/category/climatiseurs-mobiles" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-[family-name:var(--font-geist-sans)]">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg text-blue-600 tracking-tight">
              Compara<span className="text-gray-800">Pro</span>
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-gray-100 bg-white mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
            <p>
              ComparaPro — Scores calculés de façon transparente, sans affiliation commerciale.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
