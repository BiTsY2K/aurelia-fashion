'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { useStyleProfile } from '@/context/profile-store';
import { rankForProfile, describeProfile } from '@/lib/quiz';
import type { Product } from '@/types';

export default function QuizResults({ products }: { products: Product[] }) {
  const profile = useStyleProfile((s) => s.profile);
  const clearProfile = useStyleProfile((s) => s.clearProfile);
  const [mounted, setMounted] = useState(false);

  // Persisted state is client-only, so wait for mount before deciding what to show.
  useEffect(() => setMounted(true), []);

  const ranked = useMemo(
    () => (profile ? rankForProfile(products, profile) : products),
    [products, profile],
  );

  if (!mounted) {
    return <section className="container-page grid min-h-[50vh] place-items-center text-sm text-carbon-muted">Loading your edit…</section>;
  }

  if (!profile) {
    return (
      <section className="container-page grid min-h-[60vh] place-items-center text-center">
        <div>
          <p className="eyebrow">Personal edit</p>
          <h1 className="mt-3 text-display-md">Take the quiz first</h1>
          <p className="mt-3 max-w-sm text-sm text-carbon-muted">
            Four quick questions and we’ll build an edit around your size and silhouette.
          </p>
          <Link href="/style-quiz" className="btn-pill mt-6">Start the quiz</Link>
        </div>
      </section>
    );
  }

  const topPicks = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <section className="container-page py-12">
      <p className="eyebrow">Your edit</p>
      <h1 className="mt-2 text-display-md">Curated for you</h1>
      <p className="mt-3 max-w-lg text-sm text-carbon-muted">
        {describeProfile(profile)}
        {profile.size && ` We’ve prioritised pieces in stock in size ${profile.size}.`}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {profile.tags.slice(0, 6).map((tag) => (
          <span key={tag} className="rounded-pill bg-ivory-dim px-3 py-1 text-xs capitalize text-carbon-muted">{tag}</span>
        ))}
        <Link href="/style-quiz" onClick={clearProfile} className="text-xs text-carbon-muted underline">Retake quiz</Link>
      </div>

      <h2 className="mt-12 font-display text-xl">Your top picks</h2>
      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3">
        {topPicks.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {rest.length > 0 && (
        <>
          <h2 className="mt-16 font-display text-xl">You might also like</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3">
            {rest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </section>
  );
}
