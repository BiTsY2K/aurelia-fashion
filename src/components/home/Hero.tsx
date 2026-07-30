'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import SmartImage from '@/components/ui/SmartImage';
import { img } from '@/lib/media';

const ease = [0.22, 1, 0.36, 1] as const;

const Arrow = () => (
  <span className="grid h-6 w-6 place-items-center rounded-full bg-ivory text-carbon">
    <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  </span>
);

export default function Hero() {
  return (
    <section className="container-page pt-8 md:pt-14">
      <div className="grid items-center gap-10 md:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            Couture · Bespoke · Since day one, by hand
          </motion.p>
          <motion.h1
            className="mt-4 text-display-xl"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}
          >
            Made for you,
            <span className="block italic text-rose">measured to you.</span>
          </motion.h1>
          <motion.p
            className="mt-6 max-w-md text-sm leading-relaxed text-carbon-muted"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease }}
          >
            Bridal lehengas, handwoven sarees, reception gowns and Indo-Western looks for women —
            and festive wear for little girls — each one tailored to your measurements in our atelier.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease }}
          >
            <Link href="/collections/women" className="btn-pill">Shop Women <Arrow /></Link>
            <Link href="/collections/kids" className="btn-pill-ghost">Shop Kids</Link>
            <Link href="/bespoke" className="btn-pill-ghost">Design bespoke</Link>
          </motion.div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6">
            {[['100%', 'Tailored to fit'], ['40+', 'Artisan partners'], ['1:1', 'Stylist on WhatsApp']].map(([k, v]) => (
              <div key={v}>
                <dt className="font-display text-2xl">{k}</dt>
                <dd className="mt-1 text-xs text-carbon-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <motion.div
            className="relative ml-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[28px]"
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease }}
          >
            <SmartImage
              src={img('1617627143750-d86bc21e42bb', 1000)}
              alt="Bride in a rani-pink Kanjivaram silk saree with temple jewellery"
              fill priority
              className="object-cover object-top"
              sizes="(max-width: 768px) 92vw, 45vw"
            />
          </motion.div>
          <motion.div
            className="absolute -bottom-6 left-0 hidden w-44 overflow-hidden rounded-card border-4 border-ivory shadow-lift sm:block md:-left-6"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease }}
          >
            <div className="relative aspect-[3/4]">
              <SmartImage src={img('1610173827043-9db50e0d8ef9', 400)} alt="Bridal lehenga detail" fill className="object-cover" sizes="176px" />
            </div>
          </motion.div>
          <motion.div
            className="absolute right-4 top-4 rounded-pill bg-ivory/90 px-4 py-2 text-xs shadow-soft backdrop-blur"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          >
            ✦ The Bridal Edit is here
          </motion.div>
        </div>
      </div>
    </section>
  );
}
