'use client';

import { useEffect, useState } from 'react';
import { useWishlist, saveWishlist } from '@/context/wishlist-store';
import { useAuth } from '@/context/auth-provider';
import { cn } from '@/lib/utils';

export default function WishlistButton({
  productId,
  className,
  withLabel = false,
}: {
  productId: string;
  className?: string;
  withLabel?: boolean;
}) {
  const { ids, toggle } = useWishlist();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Avoid a hydration mismatch: persisted state only exists on the client.
  useEffect(() => setMounted(true), []);

  const saved = mounted && ids.includes(productId);

  const handle = () => {
    toggle(productId);
    if (user) {
      const next = ids.includes(productId) ? ids.filter((i) => i !== productId) : [...ids, productId];
      saveWishlist(user.uid, next);
    }
  };

  return (
    <button
      onClick={handle}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={cn(
        'inline-flex items-center gap-2 rounded-pill transition-colors',
        withLabel ? 'border border-line px-4 py-2.5 text-sm hover:border-carbon' : 'p-2',
        className,
      )}
    >
      <svg
        width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.7"
        stroke="currentColor" fill={saved ? 'currentColor' : 'none'}
        className={cn('transition-colors', saved && 'text-terracotta')}
        aria-hidden
      >
        <path d="M12 20.5 4.2 12.9a4.6 4.6 0 0 1 0-6.6 4.8 4.8 0 0 1 6.7 0l1.1 1 1.1-1a4.8 4.8 0 0 1 6.7 0 4.6 4.6 0 0 1 0 6.6Z" strokeLinejoin="round" />
      </svg>
      {withLabel && (saved ? 'Saved' : 'Save for later')}
    </button>
  );
}
