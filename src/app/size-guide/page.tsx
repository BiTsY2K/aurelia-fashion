import type { Metadata } from 'next';
import Link from 'next/link';
import SizeGuide from '@/components/product/SizeGuide';
import { MEASUREMENT_FIELDS } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Size Guide & How to Measure',
  description: 'Women’s and girls’ size charts, plus how to take your measurements for a custom Aurelia fit.',
  alternates: { canonical: '/size-guide' },
};

export default function SizeGuidePage() {
  return (
    <section className="container-page py-12 md:py-16">
      <p className="eyebrow">Fit</p>
      <h1 className="mt-3 text-display-lg">Size guide</h1>
      <p className="mt-4 max-w-xl text-sm text-carbon-muted">
        Every Aurelia piece can be tailored. Use a standard size, or send us your own measurements on any product page.
      </p>

      <div className="mt-12 grid gap-14 lg:grid-cols-2">
        <SizeGuide set="women" />
        <SizeGuide set="kids" />
      </div>

      <div className="mt-16 rounded-[28px] bg-blush-soft p-8 md:p-12">
        <h2 className="text-display-md">How to measure</h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {(['women', 'kids'] as const).map((set) => (
            <div key={set}>
              <p className="font-display text-xl">{set === 'women' ? 'For women' : 'For girls'}</p>
              <dl className="mt-4 space-y-3 text-sm">
                {MEASUREMENT_FIELDS[set].map((f) => (
                  <div key={f.id} className="flex gap-3">
                    <dt className="w-36 shrink-0 font-medium">{f.label}</dt>
                    <dd className="text-carbon-muted">{f.hint}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <Link href="/bespoke" className="btn-pill mt-10">Start a custom order</Link>
      </div>
    </section>
  );
}
