'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import ProductGallery from '@/components/product/ProductGallery';
import WishlistButton from '@/components/product/WishlistButton';
import SizeGuide from '@/components/product/SizeGuide';
import MeasurementFields from '@/components/product/MeasurementFields';
import WhatsAppOrderDialog from '@/components/product/WhatsAppOrderDialog';
import Modal from '@/components/ui/Modal';
import { WhatsAppGlyph } from '@/components/layout/Concierge';
import { trackView } from '@/components/layout/PageViewTracker';
import { useCart } from '@/context/cart-store';
import { CUSTOM_SIZE, sizeSetFor, sizesFor } from '@/lib/catalog';
import { enquiryMessage, openWhatsApp, type EnquiryDetails } from '@/lib/enquiry';
import { formatPrice, cn } from '@/lib/utils';
import type { Category, Measurements, Product } from '@/types';

type FitMode = 'standard' | 'custom';

function Section({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left font-display text-lg">
        {title}
        <span className={cn('text-xl text-carbon-muted transition-transform duration-300', open && 'rotate-45')}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="pb-5 text-sm leading-relaxed text-carbon-muted">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetail({
  product,
  department,
  subcategory,
}: {
  product: Product;
  department?: Category;
  subcategory?: Category;
}) {
  const add = useCart((s) => s.add);
  const sizeSet = sizeSetFor(product);
  const sizes = sizesFor(product);
  const canCustomise = Boolean(product.customizable || product.madeToOrder);

  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [mode, setMode] = useState<FitMode>(product.madeToOrder ? 'custom' : 'standard');
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [qty, setQty] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => { trackView(product.id, product.name); }, [product.id, product.name]);

  const variant = product.variants[colorIdx] ?? product.variants[0];
  const stockForColor = product.sizesStock[variant.name] ?? {};
  const stockForSize = size ? (stockForColor[size] ?? 0) : 0;
  const anyStock = sizes.some((s) => (stockForColor[s] ?? 0) > 0);
  const hasMeasurements = Object.values(measurements).some((v) => v?.trim());

  const canAdd = mode === 'custom'
    ? hasMeasurements
    : size !== null && qty > 0 && qty <= stockForSize;

  const details = (): EnquiryDetails => ({
    product,
    color: variant.name,
    size: mode === 'custom' ? CUSTOM_SIZE : size ?? undefined,
    measurements: mode === 'custom' ? measurements : undefined,
    pageUrl: typeof window !== 'undefined' ? window.location.href.split('?')[0] : undefined,
  });

  const addToCart = () => {
    if (!canAdd) {
      setNotice(mode === 'custom' ? 'Add at least one measurement, or switch to a standard size.' : 'Choose a size first.');
      return;
    }
    setNotice('');
    add({
      productId: product.id,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      image: variant.images[0] ?? '',
      color: variant.name,
      size: mode === 'custom' ? CUSTOM_SIZE : size!,
      price: product.price,
      quantity: mode === 'custom' ? 1 : qty,
      ...(mode === 'custom' ? { measurements } : {}),
    });
  };

  const enquire = () => openWhatsApp('enquiry', enquiryMessage(details()), details());

  const leadTime = product.leadTimeDays
    ? product.madeToOrder
      ? `Made to order · ready in about ${product.leadTimeDays} days`
      : `Ships in ${Math.min(product.leadTimeDays, 5)}–${product.leadTimeDays} days · tailoring included`
    : null;

  return (
    <section className="container-page py-8 md:py-14">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-carbon-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-carbon">Home</Link></li>
          {department && <><li aria-hidden>/</li><li><Link href={`/collections/${department.slug}`} className="hover:text-carbon">{department.name}</Link></li></>}
          {subcategory && <><li aria-hidden>/</li><li><Link href={`/collections/${subcategory.slug}`} className="hover:text-carbon">{subcategory.name}</Link></li></>}
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-carbon">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        <ProductGallery images={variant.images} alt={`${product.name} in ${variant.name}`} />

        <div>
          <p className="eyebrow">{subcategory?.name ?? product.subcategory} · SKU {product.sku}</p>
          <h1 className="mt-2 text-display-md">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <p className="font-display text-2xl">{formatPrice(product.price, product.currency)}</p>
            {product.compareAtPrice && (
              <p className="text-base text-carbon-muted line-through">{formatPrice(product.compareAtPrice, product.currency)}</p>
            )}
            <p className="text-xs text-carbon-muted">Inclusive of GST</p>
          </div>
          {product.rating && (
            <p className="mt-1 text-sm text-champagne">
              {'★'.repeat(Math.round(product.rating))} <span className="text-carbon-muted">{product.rating.toFixed(1)}</span>
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-wider">
            {product.madeToOrder && <span className="rounded-pill bg-blush px-3 py-1 text-rose-deep">Made to order</span>}
            {canCustomise && <span className="rounded-pill bg-ivory-dim px-3 py-1 text-carbon">Custom fit available</span>}
            {!product.madeToOrder && !anyStock && <span className="rounded-pill bg-ivory-dim px-3 py-1 text-terracotta">Sold out in this colour</span>}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-carbon-muted">{product.description}</p>

          {/* Colour */}
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-carbon-muted">Colour: <span className="text-carbon">{variant.name}</span></p>
            <div className="flex gap-2">
              {product.variants.map((v, i) => (
                <button key={v.name} onClick={() => { setColorIdx(i); setSize(null); }} aria-label={v.name} title={v.name}
                  aria-pressed={i === colorIdx}
                  className={cn('h-9 w-9 rounded-full border-2 ring-offset-2 ring-offset-ivory transition', i === colorIdx ? 'border-carbon ring-1 ring-carbon' : 'border-line')}
                  style={{ backgroundColor: v.hex }} />
              ))}
            </div>
          </div>

          {/* Fit: standard size or custom measurements */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              {canCustomise && !product.madeToOrder ? (
                <div className="inline-flex rounded-pill border border-line p-1 text-xs" role="tablist" aria-label="Fit">
                  {(['standard', 'custom'] as FitMode[]).map((m) => (
                    <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
                      className={cn('rounded-pill px-4 py-1.5 transition-colors', mode === m ? 'bg-carbon text-ivory' : 'text-carbon-muted hover:text-carbon')}>
                      {m === 'standard' ? 'Standard size' : 'Custom measurements'}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-medium text-carbon-muted">{mode === 'custom' ? 'Your measurements' : 'Size'}</p>
              )}
              <button onClick={() => setGuideOpen(true)} className="text-xs text-carbon underline underline-offset-4">Size guide</button>
            </div>

            {mode === 'standard' ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const avail = (stockForColor[s] ?? 0) > 0;
                    return (
                      <button key={s} disabled={!avail} onClick={() => setSize(s)} aria-pressed={size === s}
                        className={cn('h-10 min-w-11 rounded-lg border px-3 text-sm transition',
                          !avail && 'cursor-not-allowed text-carbon-muted/40 line-through',
                          size === s ? 'border-carbon bg-carbon text-ivory' : 'border-line hover:border-carbon')}>
                        {s}
                      </button>
                    );
                  })}
                </div>
                {size && stockForSize <= 3 && stockForSize > 0 && (
                  <p className="mt-2 text-xs text-terracotta">Only {stockForSize} left in {size}.</p>
                )}
                {!anyStock && canCustomise && (
                  <p className="mt-2 text-xs text-carbon-muted">
                    Not in stock — <button onClick={() => setMode('custom')} className="underline">have it made to your measurements</button>.
                  </p>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-line bg-ivory-soft p-4">
                <MeasurementFields set={sizeSet} value={measurements} onChange={setMeasurements} />
                <p className="mt-3 text-[11px] text-carbon-muted">
                  Not sure? Fill in what you know — our master tailor confirms every measurement on a quick call before cutting.
                </p>
              </div>
            )}
          </div>

          {leadTime && <p className="mt-4 text-xs text-carbon-muted">{leadTime}</p>}

          {/* Actions */}
          <div className="mt-6 flex items-center gap-3">
            {mode === 'standard' && (
              <div className="flex items-center rounded-pill border border-line">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2" aria-label="Decrease quantity">−</button>
                <span className="w-8 text-center text-sm" aria-live="polite">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(stockForSize || 1, q + 1))} className="px-3 py-2" aria-label="Increase quantity">+</button>
              </div>
            )}
            <button onClick={addToCart} className={cn('btn-pill flex-1 justify-center', !canAdd && 'opacity-60')}>
              {mode === 'custom' ? 'Add custom order to bag' : size ? 'Add to bag' : 'Select a size'}
            </button>
          </div>
          {notice && <p className="mt-2 text-xs text-terracotta" role="alert">{notice}</p>}

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button onClick={() => setOrderOpen(true)}
              className="flex items-center justify-center gap-2 rounded-pill bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition-transform duration-300 ease-brand hover:scale-[1.02]">
              <WhatsAppGlyph /> Order via WhatsApp
            </button>
            <button onClick={enquire} className="btn-pill-ghost justify-center py-3">
              <span className="text-[#25D366]"><WhatsAppGlyph size={16} /></span> Enquire on WhatsApp
            </button>
          </div>
          <WishlistButton productId={product.id} withLabel className="mt-3 w-full justify-center" />

          {/* Story + details */}
          <div className="mt-8 border-t border-line">
            {product.designStory && (
              <Section title="The design story" defaultOpen>
                <p className="font-display text-base italic text-carbon">{product.designStory}</p>
              </Section>
            )}
            <Section title="Fabric & craft" defaultOpen={!product.designStory}>
              <dl className="space-y-2">
                {product.fabric && <div className="flex gap-3"><dt className="w-24 shrink-0 text-carbon">Fabric</dt><dd>{product.fabric}</dd></div>}
                <div className="flex gap-3"><dt className="w-24 shrink-0 text-carbon">Care</dt><dd>{product.fabricCare}</dd></div>
                {product.occasions?.length ? (
                  <div className="flex gap-3"><dt className="w-24 shrink-0 text-carbon">Occasions</dt><dd className="capitalize">{product.occasions.join(', ')}</dd></div>
                ) : null}
              </dl>
            </Section>
            <Section title="Size & fit">
              <SizeGuide set={sizeSet} compact />
            </Section>
            <Section title="Tailoring, delivery & alterations">
              <ul className="space-y-1.5">
                <li>Every piece is finished to your size or measurements in our atelier.</li>
                <li>Free shipping across India on orders above ₹5,000; international on request.</li>
                <li>One complimentary alteration within 15 days of delivery.</li>
                <li>Custom and made-to-order pieces can’t be returned, but we’ll alter until it fits.</li>
              </ul>
            </Section>
          </div>
        </div>
      </div>

      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Size guide" wide>
        <SizeGuide set={sizeSet} compact />
        {canCustomise && (
          <button onClick={() => { setGuideOpen(false); setMode('custom'); }} className="btn-pill mt-5">
            Use my own measurements instead
          </button>
        )}
      </Modal>
      <WhatsAppOrderDialog open={orderOpen} onClose={() => setOrderOpen(false)} details={details()} />
    </section>
  );
}
