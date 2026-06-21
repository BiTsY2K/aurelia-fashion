import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';

export function Curated() {
  return (
    <section className="container-page mt-28">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-display-md leading-tight">
            Discover curated pieces that combine timeless elegance with modern trends, designed to make every look unforgettable.
          </h2>
          <p className="mt-5 max-w-md text-sm text-carbon-muted">
            Step into a world where every detail of your style tells a story and defines your signature look.
          </p>
          <Link href="/collections" className="btn-pill mt-7">
            Discover Outfits
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ivory text-carbon">
              <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </Link>
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-card">
            <SmartImage
              src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=70"
              alt="A couple seated in coordinated casual outfits"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 45vw"
            />
          </div>
        </div>
        <div className="relative aspect-[3/4] overflow-hidden rounded-card">
          <SmartImage
            src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=70"
            alt="Model seated wearing a tailored blazer"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 90vw, 45vw"
          />
        </div>
      </div>
    </section>
  );
}

const REVIEWS = [
  { name: 'Michael Brown', place: 'London, UK', stars: 5, text: 'I get compliments everywhere I go. Their designs make dressing up effortless and fun.' },
  { name: 'Guy Hawkins', place: 'London, UK', stars: 5, text: 'Every piece I’ve bought feels made just for me. The quality and fit — everything is perfect.' },
  { name: 'Sarah Jane', place: 'Michigan, US', stars: 4, text: 'Beautiful pieces and a smooth experience from cart to delivery.' },
  { name: 'Wade Warren', place: 'Michigan, US', stars: 5, text: 'Shopping here is a joy. The attention to detail keeps me coming back for more.' },
];

export function Testimonials() {
  return (
    <section className="container-page mt-28">
      <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Testimonials</p>
          <h2 className="mt-3 text-display-md">Our Customer<br />Talk About Us</h2>
          <p className="mt-6 text-sm text-carbon-muted">★ 4.9/5 · based on 50k+ reviews</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="rounded-card bg-ivory-soft p-5 shadow-soft">
              <div className="mb-2 text-champagne" aria-label={`${r.stars} out of 5 stars`}>
                {'★'.repeat(r.stars)}<span className="text-line">{'★'.repeat(5 - r.stars)}</span>
              </div>
              <blockquote className="text-sm text-carbon">{r.text}</blockquote>
              <figcaption className="mt-3 text-xs text-carbon-muted">{r.name} · {r.place}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OwnYourStyle() {
  return (
    <section className="container-page mt-28">
      <div className="grid items-center gap-8 overflow-hidden rounded-card bg-ivory-soft md:grid-cols-2">
        <div className="p-8 md:p-12">
          <h2 className="text-display-md">Own Your Style</h2>
          <p className="mt-4 max-w-sm text-sm text-carbon-muted">
            Exclusive pieces, crafted for confidence and effortless elegance. Don’t wait — your perfect look is just a click away.
          </p>
          <Link href="/collections" className="btn-pill mt-7">
            Shop Now
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ivory text-carbon">
              <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </Link>
        </div>
        <div className="relative aspect-[4/5] md:aspect-auto md:h-full">
          <SmartImage
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=70"
            alt="Model in an all-black evening look"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 90vw, 45vw"
          />
        </div>
      </div>
    </section>
  );
}
