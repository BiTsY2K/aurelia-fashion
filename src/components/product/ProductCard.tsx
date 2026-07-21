'use client';

import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import WishlistButton from '@/components/product/WishlistButton';
import { isAvailable } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

const label = (slug: string) => slug.replace(/-/g, ' ');

export default function ProductCard({ product }: { product: Product }) {
  const variant = product.variants[0];
  const second = variant.images[1];
  const href = `/product/${product.slug}`;

  return (
    <article className="group relative">
      <WishlistButton
        productId={product.id}
        className="absolute right-2 top-2 z-10 bg-ivory/85 backdrop-blur-sm"
      />
      <Link href={href} className="block overflow-hidden rounded-card bg-ivory-soft" aria-label={product.name}>
        <div className="relative aspect-[4/5]">
          <SmartImage
            src={variant.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-brand group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          {/* Second shot cross-fades in on hover where one exists. */}
          {second && (
            <span className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
              <SmartImage src={second} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
            </span>
          )}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.compareAtPrice && (
              <span className="rounded-pill bg-carbon px-2.5 py-1 text-[10px] font-medium text-ivory">Sale</span>
            )}
            {product.madeToOrder && (
              <span className="rounded-pill bg-blush px-2.5 py-1 text-[10px] font-medium text-rose-deep">Made to order</span>
            )}
            {!isAvailable(product) && (
              <span className="rounded-pill bg-ivory px-2.5 py-1 text-[10px] font-medium text-terracotta">Sold out</span>
            )}
          </div>
          <span className="absolute inset-x-3 bottom-3 translate-y-2 rounded-pill bg-ivory/90 py-2 text-center text-xs font-medium opacity-0 backdrop-blur-sm transition duration-300 ease-brand group-hover:translate-y-0 group-hover:opacity-100">
            {product.customizable ? 'View · custom fit available' : 'View details'}
          </span>
        </div>
      </Link>

      <div className="mt-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-carbon-muted">{label(product.subcategory)}</p>
        <Link href={href} className="mt-0.5 line-clamp-1 text-sm text-carbon hover:underline">
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
    </article>
  );
}
