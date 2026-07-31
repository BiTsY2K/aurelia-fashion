import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import Concierge from '@/components/layout/Concierge';
import PageViewTracker from '@/components/layout/PageViewTracker';
import { AuthProvider } from '@/context/auth-provider';
import PersonalizationSync from '@/components/layout/PersonalizationSync';
import CartSync from '@/components/layout/CartSync';
import { buildTree } from '@/lib/catalog';
import { getCategories } from '@/lib/products';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Aurelia — Couture & Bespoke Designer Wear',
    template: '%s · Aurelia',
  },
  description:
    'Aurelia is a couture boutique for women and young girls — bridal lehengas, handwoven sarees, gowns and Indo-Western looks, tailored to your measurements.',
  keywords: [
    'designer boutique', 'bespoke tailoring', 'custom lehenga', 'bridal saree', 'designer gowns',
    'indo-western', 'kids ethnic wear', 'girls party wear', 'Aurelia',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Aurelia',
    title: 'Aurelia — Couture & Bespoke Designer Wear',
    description: 'Bridal, festive and party wear for women and girls — made to your measure.',
    url: siteUrl,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Aurelia couture boutique' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurelia — Couture & Bespoke Designer Wear',
    description: 'Bridal, festive and party wear for women and girls — made to your measure.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Aurelia',
  url: siteUrl,
  logo: `${siteUrl}/logo.svg`,
  sameAs: ['https://instagram.com', 'https://facebook.com'],
};

// Categories change rarely; refresh the menu at most every 10 minutes.
export const revalidate = 600;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tree = buildTree(await getCategories());

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <AuthProvider>
          <PersonalizationSync />
          <CartSync />
          <PageViewTracker />
          <Header tree={tree} />
          <main>{children}</main>
          <Footer tree={tree} />
          <CartDrawer />
          <Concierge />
        </AuthProvider>
      </body>
    </html>
  );
}
