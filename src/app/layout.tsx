import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { AuthProvider } from '@/context/auth-provider';

const playfair = { variable: '--font-display' };

const inter = { variable: '--font-sans' };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Aurelia — Fashion That Defines You',
    template: '%s · Aurelia',
  },
  description:
    'Aurelia is a modern boutique of refined fashion made for comfort, confidence, and effortless elegance.',
  keywords: ['boutique', 'fashion', 'minimal', 'premium clothing', 'Aurelia'],
  openGraph: {
    type: 'website',
    siteName: 'Aurelia',
    title: 'Aurelia — Fashion That Defines You',
    description: 'Refined fashion made for comfort, confidence, and effortless elegance.',
    url: siteUrl,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Aurelia boutique' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurelia — Fashion That Defines You',
    description: 'Refined fashion made for comfort, confidence, and effortless elegance.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Aurelia',
  url: siteUrl,
  logo: `${siteUrl}/logo.svg`,
  sameAs: ['https://instagram.com', 'https://facebook.com', 'https://tiktok.com'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}
