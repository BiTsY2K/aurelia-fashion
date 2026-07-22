'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import { isAvailable, sizesFor, totalStock } from '@/lib/catalog';
import { formatPrice, cn } from '@/lib/utils';
import type { CategoryNode, Product } from '@/types';

type Sort = 'featured' | 'newest' | 'low' | 'high';
type Availability = 'all' | 'ready' | 'custom';

const chip = (active: boolean) =>
  cn('rounded-pill border px-3.5 py-1.5 text-xs transition-colors',
    active ? 'border-carbon bg-carbon text-ivory' : 'border-line text-carbon-muted hover:border-carbon hover:text-carbon');

export default function CatalogView({
  products,
  title,
  eyebrow = 'Shop',
  description,
  subcategories = [],
  breadcrumbs = [],
}: {
  products: Product[];
  title: string;
  eyebrow?: string;
  description?: string;
  /** Sub-categories to offer as quick filters (children of the current department, or all). */
  subcategories?: CategoryNode[];
  breadcrumbs?: { label: string; href: string }[];
}) {
  const maxPrice = Math.max(1000, ...products.map((p) => p.price));
  const [subs, setSubs] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [price, setPrice] = useState(maxPrice);
  const [availability, setAvailability] = useState<Availability>('all');
  const [sort, setSort] = useState<Sort>('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const colorOptions = useMemo(() => {
    const seen = new Map<string, string>();
    products.forEach((p) => p.variants.forEach((v) => seen.set(v.name, v.hex)));
    return [...seen.entries()];
  }, [products]);

  const occasionOptions = useMemo(
    () => [...new Set(products.flatMap((p) => p.occasions ?? []))].sort(),
    [products],
  );

  // Only offer sizes that belong to the size scales actually in view.
  const sizeOptions = useMemo(
    () => [...new Set(products.flatMap((p) => sizesFor(p)))],
    [products],
  );

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const visible = useMemo(() => {
    const list = products.filter((p) => {
      if (subs.length && !subs.includes(p.subcategory)) return false;
      if (occasions.length && !(p.occasions ?? []).some((o) => occasions.includes(o))) return false;
      if (price < p.price) return false;
      if (colors.length && !p.variants.some((v) => colors.includes(v.name))) return false;
      if (availability === 'ready' && (p.madeToOrder || totalStock(p) === 0)) return false;
      if (availability === 'custom' && !(p.customizable || p.madeToOrder)) return false;
      if (sizes.length) {
        // Made-to-order pieces can be cut in any size.
        const hasSize = p.madeToOrder || Object.values(p.sizesStock).some((s) => sizes.some((sz) => (s[sz] ?? 0) > 0));
        if (!hasSize) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sort === 'low') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'high') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'newest') sorted.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    if (sort === 'featured') {
      sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
        || Number(isAvailable(b)) - Number(isAvailable(a)));
    }
    return sorted;
  }, [products, subs, occasions, sizes, colors, price, availability, sort]);

  const activeCount = subs.length + occasions.length + sizes.length + colors.length
    + (price < maxPrice ? 1 : 0) + (availability !== 'all' ? 1 : 0);
  const reset = () => {
    setSubs([]); setOccasions([]); setSizes([]); setColors([]); setPrice(maxPrice); setAvailability('all');
  };

  const filters = (
    <div className="space-y-7 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg">Refine</p>
        {activeCount > 0 && <button onClick={reset} className="text-xs text-carbon-muted underline">Clear all ({activeCount})</button>}
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-carbon-muted">Availability</legend>
        <div className="space-y-1.5">
          {([['all', 'Everything'], ['ready', 'Ready to ship'], ['custom', 'Custom fit / made to order']] as const).map(([v, l]) => (
            <label key={v} className="flex cursor-pointer items-center gap-2">
              <input type="radio" name="availability" checked={availability === v} onChange={() => setAvailability(v)} className="accent-carbon" />
              {l}
            </label>
          ))}
        </div>
      </fieldset>

      {occasionOptions.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-carbon-muted">Occasion</legend>
          <div className="flex flex-wrap gap-2">
            {occasionOptions.map((o) => (
              <button key={o} onClick={() => toggle(occasions, setOccasions, o)} aria-pressed={occasions.includes(o)} className={cn(chip(occasions.includes(o)), 'capitalize')}>
                {o}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-carbon-muted">Size</legend>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((s) => (
            <button key={s} onClick={() => toggle(sizes, setSizes, s)} aria-pressed={sizes.includes(s)}
              className={cn('h-8 min-w-9 rounded-lg border px-2 text-xs', sizes.includes(s) ? 'border-carbon bg-carbon text-ivory' : 'border-line')}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-carbon-muted">Colour</legend>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map(([name, hex]) => (
            <button key={name} onClick={() => toggle(colors, setColors, name)} aria-label={name} title={name} aria-pressed={colors.includes(name)}
              className={cn('h-7 w-7 rounded-full border-2', colors.includes(name) ? 'border-carbon ring-1 ring-carbon ring-offset-2 ring-offset-ivory' : 'border-line')}
              style={{ backgroundColor: hex }} />
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="price" className="mb-2 block text-xs font-medium uppercase tracking-wide text-carbon-muted">
          Up to {formatPrice(price)}
        </label>
        <input id="price" type="range" min={0} max={maxPrice} step={500} value={price}
          onChange={(e) => setPrice(Number(e.target.value))} className="w-full accent-carbon" />
      </div>
    </div>
  );

  return (
    <section className="container-page py-10 md:py-14">
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-carbon-muted">
          <ol className="flex flex-wrap gap-1.5">
            {breadcrumbs.map((b, i) => (
              <li key={b.href} className="flex gap-1.5">
                {i > 0 && <span aria-hidden>/</span>}
                <Link href={b.href} className="hover:text-carbon">{b.label}</Link>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 text-display-lg">{title}</h1>
      {description && <p className="mt-3 max-w-xl text-sm text-carbon-muted">{description}</p>}

      {subcategories.length > 0 && (
        <div className="mt-7 flex flex-wrap gap-2" aria-label="Sub-categories">
          <button onClick={() => setSubs([])} className={chip(subs.length === 0)}>All</button>
          {subcategories.map((c) => (
            <button key={c.id} onClick={() => toggle(subs, setSubs, c.slug)} aria-pressed={subs.includes(c.slug)} className={chip(subs.includes(c.slug))}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-10 md:grid-cols-[230px_1fr]">
        <aside className="hidden md:block">{filters}</aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <button onClick={() => setFiltersOpen(true)} className="btn-pill-ghost md:hidden">
              Filters{activeCount > 0 && ` (${activeCount})`}
            </button>
            <p className="hidden text-sm text-carbon-muted md:block" aria-live="polite">{visible.length} piece{visible.length === 1 ? '' : 's'}</p>
            <label className="flex items-center gap-2 text-sm text-carbon-muted">
              <span className="sr-only sm:not-sr-only">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-pill border border-line bg-ivory px-3 py-1.5 text-carbon outline-none focus:border-carbon">
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>

          {visible.length ? (
            <motion.div layout className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {visible.map((p) => (
                  <motion.div key={p.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="rounded-card bg-ivory-soft px-6 py-16 text-center">
              <p className="font-display text-xl">Nothing matches just yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-carbon-muted">
                Every Aurelia piece can be made to order — tell us what you’re imagining.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button onClick={reset} className="btn-pill-ghost">Clear filters</button>
                <Link href="/bespoke" className="btn-pill">Design it bespoke</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div className="fixed inset-0 z-[60] bg-carbon/40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFiltersOpen(false)}>
            <motion.div role="dialog" aria-modal="true" aria-label="Filters"
              className="absolute inset-y-0 left-0 w-[86%] max-w-sm overflow-y-auto bg-ivory p-6"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}>
              {filters}
              <button onClick={() => setFiltersOpen(false)} className="btn-pill mt-8 w-full justify-center">
                Show {visible.length} piece{visible.length === 1 ? '' : 's'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
