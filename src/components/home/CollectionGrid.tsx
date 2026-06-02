'use client';

import { useMemo, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/types';

const TABS = [
  { key: 'exclusive', label: 'Exclusive' },
  { key: 'bayes', label: 'Bayes' },
  { key: 'women', label: 'Women' },
  { key: 'couple', label: 'Couple' },
  { key: 'black', label: 'Black' },
];

export default function CollectionGrid({ products }: { products: Product[] }) {
  const [tab, setTab] = useState('exclusive');
  const [sort, setSort] = useState<'featured' | 'low' | 'high'>('featured');

  const visible = useMemo(() => {
    let list = tab === 'exclusive' ? products : products.filter((p) => p.collection === tab);
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, tab, sort]);

  return (
    <section className="container-page mt-20">
      <h2 className="text-display-lg">
        The Best Collection<br />Modern Style
      </h2>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Collections">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-pill px-4 py-1.5 text-sm transition-colors ${
                tab === t.key ? 'bg-carbon text-ivory' : 'text-carbon-muted hover:bg-ivory-dim'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-carbon-muted">
          <span className="hidden sm:inline">Showing {visible.length} of {products.length} result</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-pill border border-line bg-ivory px-3 py-1.5 outline-none focus:border-carbon"
            aria-label="Sort products"
          >
            <option value="featured">Sort by</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>
      </div>

      {visible.length ? (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-carbon-muted">No pieces in this collection yet — check back soon.</p>
      )}
    </section>
  );
}
