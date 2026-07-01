'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Posts a page view to /api/track. */
export function trackView(productId?: string, name?: string) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, name }),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Counts storefront page views. Product pages report themselves (with the
 * product id) from ProductDetail, and admin traffic is never counted.
 */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/product/')) return;
    trackView();
  }, [pathname]);

  return null;
}
