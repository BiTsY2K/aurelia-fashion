import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CatalogView from '@/components/product/CatalogView';
import { buildTree, departmentOf, findCategory } from '@/lib/catalog';
import { getCategories, getProducts } from '@/lib/products';

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.filter((c) => c.active).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = findCategory(categories, slug);
  if (!category || !category.active) return { title: 'Collection not found' };
  const dept = departmentOf(categories, category);
  const title = dept.id === category.id ? `${category.name}’s Designer Wear` : `${category.name} · ${dept.name}`;
  return {
    title,
    description: category.description || `Shop ${category.name} at Aurelia — couture and bespoke designer wear.`,
    alternates: { canonical: `/collections/${category.slug}` },
    openGraph: { title, description: category.description, images: category.image ? [{ url: category.image }] : [] },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = findCategory(categories, slug);
  if (!category || !category.active) notFound();

  const dept = departmentOf(categories, category);
  const isDepartment = dept.id === category.id;
  const products = await getProducts({ category: category.slug });
  const deptNode = buildTree(categories).find((d) => d.id === dept.id);

  return (
    <CatalogView
      products={products}
      eyebrow={isDepartment ? 'Shop' : dept.name}
      title={category.name}
      description={category.description}
      subcategories={isDepartment ? deptNode?.children ?? [] : []}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Collections', href: '/collections' },
        ...(isDepartment ? [] : [{ label: dept.name, href: `/collections/${dept.slug}` }]),
      ]}
    />
  );
}
