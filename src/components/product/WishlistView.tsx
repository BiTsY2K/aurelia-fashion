'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { useWishlist } from '@/context/wishlist-store';
import type { Product } from '@/types';

export default function WishlistView({ products }: { products: Product[] }) {
  const ids = useWishlist((s) => s.ids);
  const clear = useWishlist((s) => s.clear);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const saved = products.filter((p) => ids.includes(p.id));

  if (!mounted) {
    return <section className="container-page grid min-h-[50vh] place-items-center text-sm text-carbon-muted">Loading…</section>;
  }

  return (
    <section className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Saved</p>
          <h1 className="mt-2 text-display-md">Your wishlist</h1>
        </div>
        {saved.length > 0 && (
          <button onClick={clear} className="text-xs text-carbon-muted underline">Clear all</button>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="grid min-h-[40vh] place-items-center text-center">
          <div>
            <p className="text-sm text-carbon-muted">Nothing saved yet. Tap the heart on any piece to keep it here.</p>
            <Link href="/collections" className="btn-pill mt-6">Browse the collection</Link>
          </div>
        </div>
      ) : (
        <div className="mt-9 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3">
          {saved.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}
