'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Wraps next/image with a shimmer skeleton that fades out on load.
 * Defaults to lazy loading + responsive sizes for fast LCP.
 */
export default function SmartImage({ className, alt, sizes, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  // A product saved before its photos are uploaded has no src yet — show a quiet monogram, not an error.
  if (!props.src) {
    return (
      <span className="absolute inset-0 grid place-items-center bg-ivory-dim font-display text-2xl text-carbon-muted/40" aria-label={alt} role="img">
        A
      </span>
    );
  }
  return (
    // `fill` images size to their positioned parent, so the wrapper must fill it too
    // (a plain relative span would collapse to 0px tall and hide the image).
    <span className={cn('img-skeleton block', props.fill && '!absolute inset-0', loaded && 'after:hidden bg-transparent')}>
      <Image
        {...props}
        alt={alt}
        sizes={sizes ?? '(max-width: 768px) 100vw, 33vw'}
        onLoad={() => setLoaded(true)}
        className={cn('transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', className)}
      />
    </span>
  );
}
