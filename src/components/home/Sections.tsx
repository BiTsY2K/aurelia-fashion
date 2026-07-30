import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import Reveal from '@/components/ui/Reveal';
import { img } from '@/lib/media';
import type { CategoryNode } from '@/types';

const Arrow = () => (
  <span className="grid h-6 w-6 place-items-center rounded-full bg-ivory text-carbon">
    <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  </span>
);

// Cover shots per sub-category until each category has its own image set in Admin → Categories.
const FALLBACK_COVERS: Record<string, string> = {
  sarees: img('1610030469983-98e550d6193c', 700),
  lehengas: img('1610173827043-9db50e0d8ef9', 700),
  gowns: img('1566174053879-31528523f8ae', 700),
  'indo-western': img('1622122201714-77da0ca8e5d2', 700),
  'girls-ethnic': img('1623609163859-ca93c959b98a', 700),
  frocks: img('1518831959646-742c3a14ebf7', 700),
  'party-wear': img('1476234251651-f353703a034d', 700),
};

/** Shop-by-category tiles, generated from the live category tree. */
export function CategoryTiles({ tree }: { tree: CategoryNode[] }) {
  return (
    <section className="container-page mt-28">
      {tree.map((dept) => (
        <div key={dept.id} className="mt-16 first:mt-0">
          <Reveal className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Shop by category</p>
              <h2 className="mt-2 text-display-md">{dept.name}</h2>
            </div>
            <Link href={`/collections/${dept.slug}`} className="text-sm underline underline-offset-4">Shop all</Link>
          </Reveal>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {dept.children.map((c, i) => {
              const cover = c.image || FALLBACK_COVERS[c.slug];
              return (
                <Reveal key={c.id} delay={i * 0.08}>
                  <Link href={`/collections/${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-card bg-blush-soft">
                    {cover && (
                      <SmartImage src={cover} alt={c.name} fill sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-1000 ease-brand group-hover:scale-105" />
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-carbon/65 via-carbon/5 to-transparent" />
                    <span className="absolute inset-x-4 bottom-4 text-ivory">
                      <span className="block font-display text-xl md:text-2xl">{c.name}</span>
                      <span className="mt-1 block translate-y-1 text-xs text-ivory/80 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        Explore →
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

const STEPS = [
  { n: '01', title: 'Consult', text: 'Share your occasion, colours and inspiration on WhatsApp or a video call with our designer.' },
  { n: '02', title: 'Measure', text: 'Send your measurements using our guide — or visit the atelier for a fitting.' },
  { n: '03', title: 'Craft', text: 'Artisans hand-embroider and stitch your piece. You approve progress photos along the way.' },
  { n: '04', title: 'Deliver', text: 'Delivered pressed and ready, with one complimentary alteration within 15 days.' },
];

export function BespokeProcess() {
  return (
    <section className="mt-28 bg-blush-soft py-20">
      <div className="container-page grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
            <SmartImage src={img('1583391733956-3750e0ff4e8b', 900)} alt="Ivory chikankari anarkali in motion" fill
              className="object-cover" sizes="(max-width: 768px) 92vw, 42vw" />
          </div>
        </Reveal>
        <div>
          <Reveal>
            <p className="eyebrow">Bespoke tailoring</p>
            <h2 className="mt-3 text-display-lg">Your design,<br />our hands.</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-carbon-muted">
              Bring us a sketch, a Pinterest board or just a feeling. We’ll design it with you,
              cut it to your measurements and finish it by hand.
            </p>
          </Reveal>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <li className="list-none">
                  <p className="font-display text-3xl text-rose">{s.n}</p>
                  <p className="mt-2 font-display text-xl">{s.title}</p>
                  <p className="mt-1.5 text-sm text-carbon-muted">{s.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={0.3}>
            <Link href="/bespoke" className="btn-pill mt-10">Start a bespoke design <Arrow /></Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function StyleAssistantBand() {
  return (
    <section className="container-page mt-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] bg-carbon px-6 py-16 text-center text-ivory md:px-16">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rose/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-champagne/30 blur-3xl" />
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-champagne">AI Style Assistant · Preview</p>
          <h2 className="mx-auto mt-4 max-w-xl text-display-md">Not sure what to wear?</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-ivory/70">
            Tell us the occasion, a colour you love and the weather — we’ll put together looks from the atelier.
            Virtual try-on is coming soon.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/style-assistant" className="inline-flex items-center gap-3 rounded-pill bg-ivory px-6 py-3 text-sm font-medium text-carbon transition-transform hover:scale-[1.02]">
              Try the style assistant <span className="text-rose">✦</span>
            </Link>
            <Link href="/style-quiz" className="inline-flex items-center rounded-pill border border-ivory/30 px-6 py-3 text-sm text-ivory transition-colors hover:border-ivory">
              Take the style quiz
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// Placeholder testimonials — replace with real customer reviews (with permission) before launch.
const REVIEWS = [
  { name: 'Ananya R.', place: 'Bengaluru', stars: 5, text: 'My bridal lehenga fit perfectly on the first trial. They sent progress photos at every stage — I felt part of making it.' },
  { name: 'Meera S.', place: 'Hyderabad', stars: 5, text: 'Ordered a Kanjivaram with a custom blouse entirely over WhatsApp. The blouse fit better than anything I’ve had stitched locally.' },
  { name: 'Priya K.', place: 'Pune', stars: 5, text: 'My daughter refused to take off her pavadai after the naming ceremony. Soft lining, no itchy zari. We’ll be back for Diwali.' },
  { name: 'Farah N.', place: 'Mumbai', stars: 4, text: 'The cape set was the easiest thing I’ve worn to a sangeet — and I danced all night.' },
];

export function Testimonials() {
  return (
    <section className="container-page mt-28">
      <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <p className="eyebrow">Kind words</p>
          <h2 className="mt-3 text-display-md">Worn, loved,<br />remembered.</h2>
          <p className="mt-6 text-sm text-carbon-muted">From brides, mothers and the little ones who twirl.</p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.08}>
              <figure className="h-full rounded-card bg-ivory-soft p-5 shadow-soft">
                <div className="mb-2 text-champagne" aria-label={`${r.stars} out of 5 stars`}>
                  {'★'.repeat(r.stars)}<span className="text-line">{'★'.repeat(5 - r.stars)}</span>
                </div>
                <blockquote className="text-sm text-carbon">{r.text}</blockquote>
                <figcaption className="mt-3 text-xs text-carbon-muted">{r.name} · {r.place}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhatsAppCta() {
  return (
    <section className="container-page mt-28">
      <Reveal>
        <div className="grid items-center gap-8 overflow-hidden rounded-[28px] bg-ivory-soft md:grid-cols-2">
          <div className="p-8 md:p-12">
            <p className="eyebrow">Personal styling</p>
            <h2 className="mt-3 text-display-md">A stylist, one message away.</h2>
            <p className="mt-4 max-w-sm text-sm text-carbon-muted">
              Send us a photo, a colour or a date. We reply on WhatsApp with options, fabric swatches and a quote — usually within the hour.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-pill">Message the atelier <Arrow /></Link>
              <Link href="/size-guide" className="btn-pill-ghost">How to measure</Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] md:aspect-auto md:h-full md:min-h-[420px]">
            <SmartImage src={img('1609357605129-26f69add5d6e', 900)} alt="Teal chiffon gown in a breeze" fill
              className="object-cover" sizes="(max-width: 768px) 92vw, 45vw" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
