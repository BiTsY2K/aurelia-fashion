'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function Confirmation() {
  const id = useSearchParams().get('id');
  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-16 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-champagne/20 text-champagne">
          <svg width="26" height="26" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="m5 13 4 4L19 7" /></svg>
        </div>
        <h1 className="mt-5 text-display-md">Thank you for your order</h1>
        <p className="mt-3 text-sm text-carbon-muted">
          Your payment was successful and your pieces are being prepared.
          {id && <> Your order reference is <strong>#{id.slice(0, 8)}</strong>.</>}
        </p>
        <p className="mt-2 text-sm text-carbon-muted">A confirmation, then a dispatch update with tracking, will reach you on WhatsApp and email.</p>
        <div className="mt-7 flex justify-center gap-3">
          <Link href="/collections" className="btn-pill">Continue shopping</Link>
          <Link href="/account" className="btn-pill-ghost">View orders</Link>
        </div>
      </div>
    </section>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<section className="container-page grid min-h-[60vh] place-items-center text-sm text-carbon-muted">Loading…</section>}>
      <Confirmation />
    </Suspense>
  );
}
