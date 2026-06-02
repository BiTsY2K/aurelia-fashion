'use client';

import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/cart-store';
import type { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const variant = product.variants[0];
  const firstSize = Object.keys(product.sizesStock[variant.name] ?? {})[0] as never;

  const quickAdd = () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: variant.images[0],
      color: variant.name,
      size: firstSize,
      price: product.price,
      quantity: 1,
    });
  };

  return (
    <article className="group">
      <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded-card bg-ivory-soft">
        <div className="relative aspect-[4/5]">
          <SmartImage
            src={variant.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-brand group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          {product.compareAtPrice && (
            <span className="absolute left-3 top-3 rounded-pill bg-carbon px-2.5 py-1 text-[10px] font-medium text-ivory">Sale</span>
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div>
          <Link href={`/product/${product.slug}`} className="line-clamp-1 text-sm text-carbon-muted hover:text-carbon">
            {product.name}
          </Link>
          <p className="mt-0.5 font-display text-lg">
            {formatPrice(product.price, product.currency)}
            {product.compareAtPrice && (
              <span className="ml-2 text-xs text-carbon-muted line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </span>
            )}
          </p>
        </div>
        <button onClick={quickAdd} className="btn-pill px-4 py-2 text-xs" aria-label={`Add ${product.name} to cart`}>
          Shop Now
          <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </article>
  );
}
