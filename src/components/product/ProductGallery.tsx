'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SmartImage from '@/components/ui/SmartImage';
import { cn } from '@/lib/utils';

/**
 * High-res product carousel:
 *  - hover (desktop) magnifies 2.2× around the cursor
 *  - swipe or arrow keys move between shots
 *  - tap / Enter opens a full-screen lightbox
 */
export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const touchStart = useRef<number | null>(null);
  const shots = images.length ? images : [''];

  useEffect(() => setIndex(0), [images]);

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + shots.length) % shots.length),
    [shots.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox, go]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchStart.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStart.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touchStart.current = null;
    },
  };

  const Arrows = ({ dark }: { dark?: boolean }) =>
    shots.length > 1 ? (
      <>
        {[-1, 1].map((d) => (
          <button key={d} onClick={(e) => { e.stopPropagation(); go(d); }}
            aria-label={d < 0 ? 'Previous image' : 'Next image'}
            className={cn(
              'absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full backdrop-blur-sm transition',
              d < 0 ? 'left-3' : 'right-3',
              dark ? 'bg-ivory/10 text-ivory hover:bg-ivory/20' : 'bg-ivory/80 text-carbon opacity-0 hover:bg-ivory group-hover:opacity-100 focus-visible:opacity-100',
            )}>
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d={d < 0 ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
            </svg>
          </button>
        ))}
      </>
    ) : null;

  return (
    <div className="md:sticky md:top-24">
      <div
        className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-card bg-ivory-soft"
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
        onClick={() => setLightbox(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setLightbox(true);
          if (e.key === 'ArrowRight') go(1);
          if (e.key === 'ArrowLeft') go(-1);
        }}
        tabIndex={0}
        role="button"
        aria-label={`Open full-screen view of ${alt}`}
        {...swipe}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={index} className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <SmartImage
              src={shots[index]}
              alt={`${alt} — view ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover transition-transform duration-200 ease-out"
              style={zoom ? { transform: 'scale(2.2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          </motion.div>
        </AnimatePresence>
        <Arrows />
        {shots.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
            {shots.map((_, i) => (
              <span key={i} className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-5 bg-ivory' : 'w-1.5 bg-ivory/60')} />
            ))}
          </div>
        )}
        <span className="pointer-events-none absolute bottom-3 right-3 hidden rounded-pill bg-ivory/85 px-2.5 py-1 text-[10px] uppercase tracking-wider text-carbon-muted md:block">
          Hover to zoom · click to expand
        </span>
      </div>

      {shots.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {shots.map((src, i) => (
            <button key={src + i} onClick={() => setIndex(i)} aria-label={`Show image ${i + 1}`}
              className={cn('relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition',
                i === index ? 'border-carbon' : 'border-transparent opacity-70 hover:opacity-100')}>
              <SmartImage src={src} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-carbon/95"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            role="dialog" aria-modal="true" aria-label={`${alt} gallery`}
            {...swipe}
          >
            <button onClick={() => setLightbox(false)} aria-label="Close gallery"
              className="absolute right-4 top-4 z-10 rounded-full p-2 text-ivory hover:bg-ivory/10">
              <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <div className="relative h-[88vh] w-[min(92vw,70vh)]" onClick={(e) => e.stopPropagation()}>
              <SmartImage src={shots[index]} alt={alt} fill className="object-contain" sizes="92vw" />
            </div>
            <Arrows dark />
            <p className="absolute bottom-4 text-xs text-ivory/70">{index + 1} / {shots.length}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
