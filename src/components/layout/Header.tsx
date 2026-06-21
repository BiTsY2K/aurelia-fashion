'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart, cartCount } from '@/context/cart-store';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Men', href: '/men' },
  { label: 'Women', href: '/women' },
  { label: 'Collections', href: '/collections' },
  { label: 'Sale', href: '/sale' },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const count = cartCount(items);

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-ivory/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl tracking-tight" aria-label="Aurelia home">
          Aurelia
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-pill px-3.5 py-1.5 text-sm text-carbon-muted transition-colors hover:bg-ivory-dim hover:text-carbon"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button className="rounded-pill p-2 text-carbon transition-colors hover:bg-ivory-dim" aria-label="Search">
            <Icon d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
          </button>
          <button
            onClick={openCart}
            className="relative rounded-pill p-2 text-carbon transition-colors hover:bg-ivory-dim"
            aria-label={`Cart, ${count} items`}
          >
            <Icon d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-pill bg-champagne px-1 text-[10px] font-semibold text-carbon">
                {count}
              </span>
            )}
          </button>
          <Link href="/account" className="rounded-pill p-2 text-carbon transition-colors hover:bg-ivory-dim" aria-label="Account">
            <Icon d="M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-pill p-2 text-carbon transition-colors hover:bg-ivory-dim md:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            <Icon d={open ? 'M18 6 6 18M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
          </button>
        </div>
      </div>

      {/* Mobile flyout */}
      {open && (
        <nav className="border-t border-line bg-ivory md:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col py-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-sm text-carbon transition-colors hover:bg-ivory-dim"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
