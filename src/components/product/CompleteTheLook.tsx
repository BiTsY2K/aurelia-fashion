'use client';

import { useRef } from 'react';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import WishlistButton from '@/components/product/WishlistButton';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export default function CompleteTheLook({ products }: { products: Product[] }) {
  const track = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (direction: 1 | -1) =>
    track.current?.scrollBy({ left: direction * 260, behavior: 'smooth' });

  return (
    <section className="container-page mt-20 border-t border-line pt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Curated for you</p>
          <h2 className="mt-2 font-display text-2xl">You may also love</h2>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button onClick={() => scroll(-1)} aria-label="Scroll left" className="grid h-9 w-9 place-items-center rounded-full border border-line transition-colors hover:border-carbon">
            <svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
          </button>
          <button onClick={() => scroll(1)} aria-label="Scroll right" className="grid h-9 w-9 place-items-center rounded-full border border-line transition-colors hover:border-carbon">
            <svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      <div
        ref={track}
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <article key={p.id} className="group w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[23%]">
            <div className="relative overflow-hidden rounded-card bg-ivory-soft">
              <Link href={`/product/${p.slug}`} className="block">
                <div className="relative aspect-[4/5]">
                  <SmartImage
                    src={p.variants[0].images[0]}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-brand group-hover:scale-105"
                    sizes="(max-width: 640px) 46vw, 23vw"
                  />
                </div>
              </Link>
              <WishlistButton productId={p.id} className="absolute right-2 top-2 bg-ivory/85 backdrop-blur-sm" />
            </div>
            <Link href={`/product/${p.slug}`} className="mt-3 block line-clamp-1 text-sm text-carbon-muted hover:text-carbon">
              {p.name}
            </Link>
            <p className="font-display text-lg">{formatPrice(p.price, p.currency)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
