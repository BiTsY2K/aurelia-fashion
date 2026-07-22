import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CatalogView from '@/components/product/CatalogView';
import { buildTree } from '@/lib/catalog';
import { getCategories, getProducts } from '@/lib/products';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'All Collections',
  description: 'Browse every Aurelia piece — sarees, lehengas, gowns, Indo-Western and girls’ ethnic and party wear. Filter by occasion, size, colour and price.',
  alternates: { canonical: '/collections' },
};

const EDITS: Record<string, { title: string; description: string }> = {
  new: { title: 'New In', description: 'The latest pieces from the atelier.' },
  bridal: { title: 'The Bridal Edit', description: 'Lehengas and sarees for the wedding day and every ceremony around it.' },
  festive: { title: 'The Festive Edit', description: 'Silks, organzas and embroidery for Diwali, pujas and celebrations.' },
};

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; edit?: string }>;
}) {
  const { category, edit } = await searchParams;
  // Old ?category= links now live at /collections/[slug].
  if (category) redirect(`/collections/${encodeURIComponent(category)}`);

  const [products, categories] = await Promise.all([
    getProducts(edit ? { collection: edit } : {}),
    getCategories(),
  ]);
  const tree = buildTree(categories);
  const meta = edit ? EDITS[edit] : undefined;

  return (
    <CatalogView
      products={products}
      title={meta?.title ?? 'All Collections'}
      description={meta?.description ?? 'Couture for women and young girls — every piece can be tailored to your measurements.'}
      subcategories={tree.flatMap((d) => d.children)}
    />
  );
}
