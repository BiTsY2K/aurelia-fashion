'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { useCart } from '@/context/cart-store';
import { formatPrice, whatsappLink, cn } from '@/lib/utils';
import {
  SLOTS, slotProducts, DEFAULT_POSITION, outfitShareMessage,
  type SlotId, type Outfit,
} from '@/lib/studio';
import { CUSTOM_SIZE, sizesFor } from '@/lib/catalog';
import type { Product, Size } from '@/types';

const firstAvailable = (product: Product): { color: string; size: Size } | null => {
  for (const [color, sizes] of Object.entries(product.sizesStock)) {
    for (const size of sizesFor(product)) {
      if ((sizes[size] ?? 0) > 0) return { color, size };
    }
  }
  // Made-to-order pieces are added as a custom-fit line; measurements follow on WhatsApp.
  if (product.madeToOrder) return { color: product.variants[0].name, size: CUSTOM_SIZE };
  return null;
};

export default function OutfitStudio({ products }: { products: Product[] }) {
  const add = useCart((s) => s.add);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<SlotId | null>(null);

  const [outfit, setOutfit] = useState<Outfit>({});
  const [activeSlot, setActiveSlot] = useState<SlotId>('base');
  const [note, setNote] = useState('');

  const slotted = useMemo(() => slotProducts(products), [products]);
  const chosen = (slot: SlotId) => products.find((p) => p.id === outfit[slot]?.productId);

  const total = (Object.keys(outfit) as SlotId[]).reduce(
    (sum, slot) => sum + (chosen(slot)?.price ?? 0), 0,
  );
  const filledSlots = (Object.keys(outfit) as SlotId[]).filter((s) => outfit[s]);

  const place = (slot: SlotId, productId: string) => {
    setOutfit((prev) => {
      // Tapping the same piece again removes it.
      if (prev[slot]?.productId === productId) {
        const next = { ...prev };
        delete next[slot];
        return next;
      }
      return { ...prev, [slot]: { productId, ...DEFAULT_POSITION[slot] } };
    });
  };

  // ── Dragging ──────────────────────────────────────────────
  const onPointerDown = (slot: SlotId) => (e: React.PointerEvent) => {
    dragging.current = slot;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const slot = dragging.current;
    const canvas = canvasRef.current;
    if (!slot || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setOutfit((prev) =>
      prev[slot]
        ? { ...prev, [slot]: { ...prev[slot]!, x: Math.min(95, Math.max(5, x)), y: Math.min(95, Math.max(5, y)) } }
        : prev,
    );
  }, []);

  const endDrag = () => { dragging.current = null; };

  /** Keyboard nudging so the canvas isn't mouse-only. */
  const onKeyDown = (slot: SlotId) => (e: React.KeyboardEvent) => {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [0, -2], ArrowDown: [0, 2], ArrowLeft: [-2, 0], ArrowRight: [2, 0],
    };
    const scaleStep = e.key === '+' || e.key === '=' ? 0.06 : e.key === '-' ? -0.06 : 0;
    if (!moves[e.key] && !scaleStep) return;
    e.preventDefault();

    setOutfit((prev) => {
      const item = prev[slot];
      if (!item) return prev;
      const [dx, dy] = moves[e.key] ?? [0, 0];
      return {
        ...prev,
        [slot]: {
          ...item,
          x: Math.min(95, Math.max(5, item.x + dx)),
          y: Math.min(95, Math.max(5, item.y + dy)),
          scale: Math.min(1.5, Math.max(0.4, item.scale + scaleStep)),
        },
      };
    });
  };

  // ── Actions ───────────────────────────────────────────────
  const addLookToCart = () => {
    const unavailable: string[] = [];
    let added = 0;

    for (const slot of filledSlots) {
      const product = chosen(slot);
      if (!product) continue;
      const pick = firstAvailable(product);
      if (!pick) { unavailable.push(product.name); continue; }

      add({
        productId: product.id, slug: product.slug, name: product.name,
        image: product.variants[0].images[0], color: pick.color, size: pick.size,
        price: product.price, quantity: 1,
      });
      added += 1;
    }

    setNote(
      unavailable.length
        ? `Added ${added} piece(s). Sold out: ${unavailable.join(', ')}.`
        : `Added ${added} piece(s) to your cart.`,
    );
  };

  const shareHref = whatsappLink(
    outfitShareMessage(outfit, products, process.env.NEXT_PUBLIC_SITE_URL ?? ''),
  );

  return (
    <section className="container-page py-12">
      <p className="eyebrow">The studio</p>
      <h1 className="mt-2 text-display-md">Build your look</h1>
      <p className="mt-3 max-w-lg text-sm text-carbon-muted">
        Pick a base, then layer pieces over it. Drag anything on the canvas to reposition it —
        or select it and use the arrow keys.
      </p>

      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* ── Canvas ── */}
        <div>
          <div
            ref={canvasRef}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            className="relative aspect-[4/5] w-full touch-none overflow-hidden rounded-card border border-line bg-ivory-soft sm:aspect-[16/13]"
          >
            {/* Guide line */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-line/60" />

            {filledSlots.length === 0 && (
              <p className="absolute inset-0 grid place-items-center px-8 text-center text-sm text-carbon-muted">
                Choose a base piece to start building.
              </p>
            )}

            {SLOTS.map((slot, depth) => {
              const item = outfit[slot.id];
              const product = chosen(slot.id);
              if (!item || !product) return null;

              return (
                <div
                  key={slot.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${product.name} in the ${slot.label} layer. Drag or use arrow keys to move.`}
                  onPointerDown={onPointerDown(slot.id)}
                  onKeyDown={onKeyDown(slot.id)}
                  onFocus={() => setActiveSlot(slot.id)}
                  className={cn(
                    'absolute w-[38%] max-w-[240px] cursor-grab select-none rounded-xl transition-shadow active:cursor-grabbing',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne',
                    activeSlot === slot.id && 'shadow-lift',
                  )}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    zIndex: 10 + depth,
                    transform: `translate(-50%, -50%) scale(${item.scale})`,
                  }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                    <SmartImage
                      src={product.variants[0].images[0]}
                      alt={product.name}
                      fill
                      className="pointer-events-none object-cover"
                      sizes="240px"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canvas controls */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-carbon-muted">
            <span>Selected: <strong className="text-carbon">{SLOTS.find((s) => s.id === activeSlot)?.label}</strong></span>
            <span aria-hidden>·</span>
            <span>Arrow keys move, + / − resize</span>
            {filledSlots.length > 0 && (
              <button onClick={() => { setOutfit({}); setNote(''); }} className="ml-auto underline">
                Clear canvas
              </button>
            )}
          </div>
        </div>

        {/* ── Picker + summary ── */}
        <aside>
          <div className="flex gap-1.5" role="tablist" aria-label="Outfit layers">
            {SLOTS.map((slot) => (
              <button
                key={slot.id}
                role="tab"
                aria-selected={activeSlot === slot.id}
                onClick={() => setActiveSlot(slot.id)}
                className={cn(
                  'flex-1 rounded-pill px-3 py-2 text-xs transition-colors',
                  activeSlot === slot.id ? 'bg-carbon text-ivory' : 'bg-ivory-dim text-carbon-muted hover:text-carbon',
                )}
              >
                {slot.label}
                {outfit[slot.id] && <span className="ml-1 text-champagne">●</span>}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-carbon-muted">{SLOTS.find((s) => s.id === activeSlot)?.help}</p>

          {/* Horizontal product carousel for the active layer */}
          <div className="mt-4 flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {slotted[activeSlot].length === 0 ? (
              <p className="py-6 text-sm text-carbon-muted">Nothing in this layer yet.</p>
            ) : (
              slotted[activeSlot].map((product) => {
                const selected = outfit[activeSlot]?.productId === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => place(activeSlot, product.id)}
                    aria-pressed={selected}
                    className={cn(
                      'w-24 shrink-0 rounded-xl border p-1.5 text-left transition-all',
                      selected ? 'border-carbon bg-ivory-dim' : 'border-line hover:border-carbon',
                    )}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                      <SmartImage src={product.variants[0].images[0]} alt={product.name} fill className="object-cover" sizes="96px" />
                    </div>
                    <p className="mt-1.5 line-clamp-1 text-[11px] text-carbon-muted">{product.name}</p>
                    <p className="text-xs font-medium">{formatPrice(product.price, product.currency)}</p>
                  </button>
                );
              })
            )}
          </div>

          {/* Summary */}
          <div className="mt-5 rounded-card bg-ivory-soft p-5">
            <h2 className="font-display text-lg">Your look</h2>
            {filledSlots.length === 0 ? (
              <p className="mt-2 text-sm text-carbon-muted">No pieces yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {filledSlots.map((slot) => {
                  const product = chosen(slot)!;
                  return (
                    <li key={slot} className="flex items-baseline justify-between gap-3">
                      <Link href={`/product/${product.slug}`} className="truncate hover:underline">{product.name}</Link>
                      <span className="shrink-0 text-carbon-muted">{formatPrice(product.price, product.currency)}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {filledSlots.length > 0 && (
              <>
                <div className="mt-3 flex justify-between border-t border-line pt-3 font-display text-lg">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
                <button onClick={addLookToCart} className="btn-pill mt-4 w-full justify-center">Add look to cart</button>
                <a href={shareHref} target="_blank" rel="noopener noreferrer" className="btn-pill-ghost mt-2 w-full justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z" />
                  </svg>
                  Share this look
                </a>
              </>
            )}

            {note && <p className="mt-3 text-xs text-carbon-muted" role="status">{note}</p>}
          </div>
        </aside>
      </div>
    </section>
  );
}
