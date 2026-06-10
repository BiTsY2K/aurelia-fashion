export function formatPrice(value: number, currency = 'INR') {
  // en-IN gives lakh grouping (₹1,25,000) for rupees; other currencies use their usual format.
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

/** Build a wa.me deep link with a prefilled message (used by the concierge hooks). */
export function whatsappLink(message: string) {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/[^0-9]/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
