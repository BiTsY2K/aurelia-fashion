'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart, cartCount } from '@/context/cart-store';
import { useWishlist } from '@/context/wishlist-store';
import { cn } from '@/lib/utils';
import type { CategoryNode } from '@/types';

const EXTRA_NAV = [
  { label: 'New In', href: '/collections?edit=new' },
  { label: 'Bespoke', href: '/bespoke' },
  { label: 'AI Stylist', href: '/style-assistant' },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
    className={cn('transition-transform duration-300', open && 'rotate-180')} aria-hidden>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/** Hover/focus dropdown for one department (Women, Kids, later Men). */
function DepartmentMenu({ dept }: { dept: CategoryNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link
        href={`/collections/${dept.slug}`}
        onFocus={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-sm text-carbon-muted transition-colors hover:bg-ivory-dim hover:text-carbon"
        aria-haspopup={dept.children.length > 0}
        aria-expanded={open}
      >
        {dept.name}
        {dept.children.length > 0 && <Chevron open={open} />}
      </Link>

      <AnimatePresence>
        {open && dept.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full z-50 pt-3"
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}
          >
            <div className="w-72 rounded-card border border-line bg-ivory p-3 shadow-lift">
              {dept.children.map((c) => (
                <Link key={c.id} href={`/collections/${c.slug}`} onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-ivory-dim">
                  <span className="block font-display text-base">{c.name}</span>
                  {c.description && <span className="mt-0.5 line-clamp-1 block text-xs text-carbon-muted">{c.description}</span>}
                </Link>
              ))}
              <Link href={`/collections/${dept.slug}`} onClick={() => setOpen(false)}
                className="mt-1 block rounded-xl px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-rose hover:bg-blush-soft">
                Shop all {dept.name} →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header({ tree }: { tree: CategoryNode[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const items = useCart((s) => s.items);
  const wishlistIds = useWishlist((s) => s.ids);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  const openCart = useCart((s) => s.open);
  const count = cartCount(items);

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-ivory/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl tracking-tight" aria-label="Aurelia home">
          Aurelia
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {tree.map((dept) => <DepartmentMenu key={dept.id} dept={dept} />)}
          {EXTRA_NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className="rounded-pill px-3.5 py-1.5 text-sm text-carbon-muted transition-colors hover:bg-ivory-dim hover:text-carbon">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/collections" className="rounded-pill p-2 text-carbon transition-colors hover:bg-ivory-dim" aria-label="Browse all">
            <Icon d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
          </Link>
          <Link
            href="/wishlist"
            className="relative rounded-pill p-2 text-carbon transition-colors hover:bg-ivory-dim"
            aria-label={`Wishlist, ${mounted ? wishlistIds.length : 0} items`}
          >
            <Icon d="M12 20.5 4.2 12.9a4.6 4.6 0 0 1 0-6.6 4.8 4.8 0 0 1 6.7 0l1.1 1 1.1-1a4.8 4.8 0 0 1 6.7 0 4.6 4.6 0 0 1 0 6.6Z" />
            {mounted && wishlistIds.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-pill bg-rose px-1 text-[10px] font-semibold text-ivory">
                {wishlistIds.length}
              </span>
            )}
          </Link>
          <button
            onClick={openCart}
            className="relative rounded-pill p-2 text-carbon transition-colors hover:bg-ivory-dim"
            aria-label={`Cart, ${mounted ? count : 0} items`}
          >
            <Icon d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0" />
            {mounted && count > 0 && (
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
            className="rounded-pill p-2 text-carbon transition-colors hover:bg-ivory-dim lg:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            <Icon d={open ? 'M18 6 6 18M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
          </button>
        </div>
      </div>

      {/* Mobile flyout */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-ivory lg:hidden"
            aria-label="Mobile"
          >
            <div className="container-page flex max-h-[75vh] flex-col overflow-y-auto py-2">
              {tree.map((dept) => (
                <div key={dept.id} className="border-b border-line/60">
                  <button
                    onClick={() => setExpanded((e) => (e === dept.id ? null : dept.id))}
                    className="flex w-full items-center justify-between px-2 py-3 text-left font-display text-lg"
                    aria-expanded={expanded === dept.id}
                  >
                    {dept.name}
                    <Chevron open={expanded === dept.id} />
                  </button>
                  {expanded === dept.id && (
                    <div className="pb-3 pl-4">
                      {dept.children.map((c) => (
                        <Link key={c.id} href={`/collections/${c.slug}`} className="block px-2 py-2 text-sm text-carbon-muted hover:text-carbon">
                          {c.name}
                        </Link>
                      ))}
                      <Link href={`/collections/${dept.slug}`} className="block px-2 py-2 text-sm font-medium text-rose">
                        Shop all {dept.name}
                      </Link>
                    </div>
                  )}
                </div>
              ))}
              {EXTRA_NAV.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-lg px-2 py-3 text-sm text-carbon transition-colors hover:bg-ivory-dim">
                  {n.label}
                </Link>
              ))}
              <Link href="/studio" className="rounded-lg px-2 py-3 text-sm text-carbon transition-colors hover:bg-ivory-dim">The Studio</Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
