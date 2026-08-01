import type { MetadataRoute } from 'next';
import { getCategories, getProducts } from '@/lib/products';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const staticUrls = ['', '/collections', '/bespoke', '/style-assistant', '/style-quiz', '/studio', '/size-guide', '/contact'].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.6,
  }));
  const categoryUrls = categories.filter((c) => c.active).map((c) => ({
    url: `${base}/collections/${c.slug}`,
    changeFrequency: 'daily' as const,
    priority: c.parentId ? 0.8 : 0.9,
  }));
  const productUrls = products.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  return [...staticUrls, ...categoryUrls, ...productUrls];
}
