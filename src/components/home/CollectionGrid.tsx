'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import type { CategoryNode, Product } from '@/types';

/** Featured pieces with one tab per sub-category, driven by the live category tree. */
export default function CollectionGrid({ products, tree }: { products: Product[]; tree: CategoryNode[] }) {
  const tabs = useMemo(
    () => [
      { key: 'all', label: 'All' },
      ...tree.flatMap((d) => d.children)
        .filter((c) => products.some((p) => p.subcategory === c.slug))
        .map((c) => ({ key: c.slug, label: c.name })),
    ],
    [tree, products],
  );
  const [tab, setTab] = useState('all');

  const visible = useMemo(() => {
    const list = tab === 'all' ? products : products.filter((p) => p.subcategory === tab);
    return [...list]
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
      .slice(0, 6);
  }, [products, tab]);

  return (
    <section className="container-page mt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">From the atelier</p>
          <h2 className="mt-2 text-display-lg">Signature pieces</h2>
        </div>
        <Link href={tab === 'all' ? '/collections' : `/collections/${tab}`} className="text-sm underline underline-offset-4">
          View all
        </Link>
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-line pb-3" role="tablist" aria-label="Sub-categories">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-pill px-4 py-1.5 text-sm transition-colors ${
              tab === t.key ? 'bg-carbon text-ivory' : 'text-carbon-muted hover:bg-ivory-dim'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visible.length ? (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
          {visible.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-carbon-muted">New pieces are on the cutting table — check back soon.</p>
      )}
    </section>
  );
}
