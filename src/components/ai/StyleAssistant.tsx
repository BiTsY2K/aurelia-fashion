'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import { COLOURS, OCCASIONS, WEATHER, matchOutfits, type StyleRequest } from '@/lib/style-assistant';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

const pill = (active: boolean) =>
  cn('rounded-pill border px-4 py-2 text-sm transition-colors',
    active ? 'border-carbon bg-carbon text-ivory' : 'border-line bg-ivory hover:border-carbon');

function OutfitGenerator({ products }: { products: Product[] }) {
  const [req, setReq] = useState<StyleRequest>({ audience: 'women', occasion: '', colour: '', weather: 'mild' });
  const [submitted, setSubmitted] = useState(false);
  const matches = useMemo(() => (submitted ? matchOutfits(products, req) : []), [products, req, submitted]);
  const set = <K extends keyof StyleRequest>(k: K, v: StyleRequest[K]) => setReq((r) => ({ ...r, [k]: v }));
  const ready = req.occasion && req.colour;

  return (
    <div>
      <div className="grid gap-7 rounded-[28px] border border-line bg-ivory-soft p-6 md:p-8">
        <fieldset>
          <legend className="eyebrow mb-3">Dressing</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => set('audience', 'women')} className={pill(req.audience === 'women')}>Myself</button>
            <button type="button" onClick={() => set('audience', 'kids')} className={pill(req.audience === 'kids')}>My little girl</button>
          </div>
        </fieldset>
        <fieldset>
          <legend className="eyebrow mb-3">Occasion</legend>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button type="button" key={o.value} onClick={() => set('occasion', o.value)} className={pill(req.occasion === o.value)}>{o.label}</button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="eyebrow mb-3">Colour mood</legend>
          <div className="flex flex-wrap gap-2">
            {COLOURS.map((c) => (
              <button type="button" key={c.value} onClick={() => set('colour', c.value)} className={cn(pill(req.colour === c.value), 'flex items-center gap-2')}>
                <span className="h-3.5 w-3.5 rounded-full border border-line" style={{ backgroundColor: c.hex }} />
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="eyebrow mb-3">Weather</legend>
          <div className="flex flex-wrap gap-2">
            {WEATHER.map((w) => (
              <button type="button" key={w.value} onClick={() => set('weather', w.value)} className={pill(req.weather === w.value)}>{w.label}</button>
            ))}
          </div>
        </fieldset>
        <button onClick={() => setSubmitted(true)} disabled={!ready} className="btn-pill w-fit disabled:opacity-40">
          {ready ? 'Style me ✦' : 'Pick an occasion and a colour'}
        </button>
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
            <h2 className="text-display-md">Your edit</h2>
            {matches.length ? (
              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
                {matches.map((m) => (
                  <div key={m.product.id}>
                    <ProductCard product={m.product} />
                    <ul className="mt-2 space-y-0.5 text-xs text-carbon-muted">
                      {m.reasons.slice(0, 3).map((r) => <li key={r}>✦ {r}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-carbon-muted">
                Nothing in the current collection is quite right — <Link href="/bespoke" className="underline">let us design it for you</Link>.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Virtual try-on placeholder. The photo never leaves the device — it's shown
 * from a local object URL — so the UI can be tested before a try-on model is wired in.
 */
function TryOnPreview() {
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);

  return (
    <div className="grid gap-8 rounded-[28px] bg-carbon p-6 text-ivory md:grid-cols-2 md:p-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-champagne">Coming soon · Virtual try-on</p>
        <h2 className="mt-3 text-display-md">See it on you before it’s made.</h2>
        <p className="mt-4 max-w-sm text-sm text-ivory/70">
          Upload a full-length photo and preview a lehenga or saree draped on you, against a wedding, mandap or garden backdrop.
          We’re training this with our own collection — join the preview list on WhatsApp.
        </p>
        <label className="mt-7 inline-flex cursor-pointer items-center gap-3 rounded-pill bg-ivory px-6 py-3 text-sm font-medium text-carbon">
          <input type="file" accept="image/*" className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPhoto(URL.createObjectURL(file));
            }} />
          {photo ? 'Choose another photo' : 'Try with a photo'}
        </label>
        <p className="mt-3 text-[11px] text-ivory/50">Your photo stays on this device. Nothing is uploaded.</p>
      </div>
      <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-card border border-ivory/15 bg-ivory/5">
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="Your uploaded photo" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-4 bottom-4 rounded-xl bg-carbon/80 p-3 text-center text-xs backdrop-blur">
              Outfit overlay preview arrives with the try-on release ✦
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-sm text-ivory/50">
            <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /></svg>
            Your preview appears here
          </div>
        )}
      </div>
    </div>
  );
}

export default function StyleAssistant({ products }: { products: Product[] }) {
  return (
    <section className="container-page py-12 md:py-16">
      <p className="eyebrow">AI Style Assistant · Preview</p>
      <h1 className="mt-3 max-w-2xl text-display-lg">Tell us the moment. <span className="italic text-rose">We’ll style it.</span></h1>
      <p className="mt-4 max-w-xl text-sm text-carbon-muted">
        Pick the occasion, a colour mood and the weather, and we’ll match looks from the atelier.
        For a conversation, open the concierge in the corner and ask the AI stylist directly.
      </p>
      <div className="mt-10"><OutfitGenerator products={products} /></div>
      <div className="mt-16"><TryOnPreview /></div>
    </section>
  );
}
