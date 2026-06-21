import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Customer Care',
    links: ['Contact Us', 'FAQs', 'Shipping & Returns', 'Size Guide', 'Blog'],
  },
  {
    title: 'Collections',
    links: ['New Arrivals', 'Best Sellers', 'Accessories', 'Sale'],
  },
  {
    title: 'Connect With Us',
    links: ['Instagram', 'Facebook', 'TikTok'],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ivory-soft">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <p className="font-display text-2xl">Aurelia</p>
          <p className="mt-3 max-w-xs text-sm text-carbon-muted">Subscribe for new drops, private sales, and styling notes.</p>
          <form className="mt-4 flex max-w-sm items-center gap-2">
            <label htmlFor="newsletter" className="sr-only">Email address</label>
            <input
              id="newsletter"
              type="email"
              required
              placeholder="Enter your email"
              className="h-11 flex-1 rounded-pill border border-line bg-ivory px-4 text-sm outline-none focus:border-carbon"
            />
            <button type="submit" className="btn-pill h-11 px-5">Subscribe</button>
          </form>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="eyebrow mb-4">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-carbon-muted transition-colors hover:text-carbon">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-carbon-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Aurelia. All rights reserved.</p>
          <div className="flex items-center gap-3 opacity-70">
            <span>VISA</span><span>Mastercard</span><span>UPI</span><span>PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
