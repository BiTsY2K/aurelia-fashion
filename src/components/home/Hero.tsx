import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';

const BRANDS = ['Connect', 'POSI+IV', 'INFINI', 'OCUS', 'Pinpoint'];

export default function Hero() {
  return (
    <section className="container-page pt-10 md:pt-16">
      <div className="grid items-start gap-8 md:grid-cols-[1.1fr_1fr_0.9fr]">
        {/* Headline */}
        <div className="animate-fade-up">
          <h1 className="text-display-xl">
            Discover<br />Fashion That
            <span className="mt-1 block text-carbon-muted">
              <span className="mr-3 inline-block h-px w-10 align-middle bg-carbon-muted" />Defines You
            </span>
          </h1>
          <Link href="/collections" className="btn-pill mt-7">
            Discover Outfits
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ivory text-carbon">
              <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </Link>
        </div>

        {/* Model */}
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm">
          <SmartImage
            src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=70"
            alt="Model in a structured grey blazer and ivory trousers"
            fill
            priority
            className="object-cover object-top"
            sizes="(max-width: 768px) 90vw, 33vw"
          />
        </div>

        {/* Stats column */}
        <div className="flex flex-col gap-6 md:pt-6">
          <div className="text-champagne">
            <svg width="26" height="26" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4" fill="none"><path d="M12 4v16M4 12h16" /></svg>
          </div>
          <p className="max-w-xs text-sm text-carbon-muted">
            Explore refined fashion pieces made for comfort, confidence, and effortless elegance.
          </p>
          <div>
            <p className="font-display text-3xl">2.9M+</p>
            <p className="mt-1 max-w-[16rem] text-xs text-carbon-muted">
              Trusted to use by millions of users over 150 countries.
            </p>
          </div>
        </div>
      </div>

      {/* Brand strip card */}
      <div className="mt-8 rounded-card bg-ivory-soft px-6 py-8 text-center shadow-soft">
        <p className="font-display text-lg md:text-xl">Backed by the World’s Most Influential Fashion Brands</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium tracking-wide text-carbon-muted">
          {BRANDS.map((b) => (
            <span key={b}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
