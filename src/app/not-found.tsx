import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container-page grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-display-md">This page slipped off the rail</h1>
        <p className="mt-3 text-sm text-carbon-muted">The piece you’re looking for has moved or sold out.</p>
        <Link href="/" className="btn-pill mt-7">Back to home</Link>
      </div>
    </section>
  );
}
