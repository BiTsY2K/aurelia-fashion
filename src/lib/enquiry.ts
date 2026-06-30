'use client';

import { MEASUREMENT_FIELDS, sizeSetFor } from '@/lib/catalog';
import { formatPrice, whatsappLink } from '@/lib/utils';
import type { InquiryChannel, InquiryType, Measurements, Product } from '@/types';

export interface EnquiryDetails {
  product?: Product;
  color?: string;
  size?: string;
  measurements?: Measurements;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  occasionDate?: string;
  message?: string;
  pageUrl?: string;
}

const filled = (m?: Measurements) =>
  Object.entries(m ?? {}).filter(([, v]) => v && String(v).trim());

function measurementLines(product: Product | undefined, m?: Measurements): string[] {
  const entries = filled(m);
  if (!entries.length) return [];
  const fields = MEASUREMENT_FIELDS[product ? sizeSetFor(product) : 'women'];
  return [
    'Measurements (inches):',
    ...entries.map(([id, v]) => {
      const label = fields.find((f) => f.id === id)?.label ?? id;
      return `  • ${label}: ${v}${id === 'age' ? ' yrs' : ''}`;
    }),
  ];
}

function productLines(d: EnquiryDetails): string[] {
  const p = d.product;
  if (!p) return [];
  return [
    `Product: ${p.name}`,
    `SKU: ${p.sku}`,
    `Price: ${formatPrice(p.price, p.currency)}`,
    d.color ? `Colour: ${d.color}` : '',
    d.size ? `Size: ${d.size}` : '',
  ].filter(Boolean);
}

/** "Enquire on WhatsApp" — a question about a piece. */
export function enquiryMessage(d: EnquiryDetails): string {
  return [
    `Hi Aurelia! I'd like to know more about this piece.`,
    '',
    ...productLines(d),
    ...measurementLines(d.product, d.measurements),
    d.message ? `\nQuestion: ${d.message}` : '',
    d.pageUrl ? `\nLink: ${d.pageUrl}` : '',
  ].filter((l) => l !== '').join('\n');
}

/** "Order via WhatsApp" — a custom order with the customer's details filled in. */
export function orderMessage(d: EnquiryDetails): string {
  return [
    `Hi Aurelia! I'd like to place an order.`,
    '',
    ...productLines(d),
    ...measurementLines(d.product, d.measurements),
    '',
    'My details:',
    d.name ? `  • Name: ${d.name}` : '',
    d.phone ? `  • Phone: ${d.phone}` : '',
    d.email ? `  • Email: ${d.email}` : '',
    d.city ? `  • City: ${d.city}` : '',
    d.occasionDate ? `  • Needed by: ${d.occasionDate}` : '',
    d.message ? `\nNotes: ${d.message}` : '',
    d.pageUrl ? `\nLink: ${d.pageUrl}` : '',
  ].filter((l) => l !== '').join('\n');
}

/** Bespoke / made-to-measure request from the design-your-own form. */
export function bespokeMessage(d: EnquiryDetails & { garment?: string; budget?: string }): string {
  return [
    `Hi Aurelia! I'd love a bespoke piece designed for me.`,
    '',
    d.garment ? `Garment: ${d.garment}` : '',
    d.budget ? `Budget: ${d.budget}` : '',
    d.occasionDate ? `Needed by: ${d.occasionDate}` : '',
    d.name ? `Name: ${d.name}` : '',
    d.phone ? `Phone: ${d.phone}` : '',
    d.city ? `City: ${d.city}` : '',
    ...measurementLines(undefined, d.measurements),
    d.message ? `\nIdea: ${d.message}` : '',
  ].filter((l) => l !== '').join('\n');
}

/**
 * Records an inquiry for the admin tracker; resolves true only once it is stored. Uses `keepalive`
 * so the request survives the tab switching to WhatsApp, and a failure never
 * blocks the customer from reaching the boutique.
 */
export function logInquiry(
  type: InquiryType,
  channel: InquiryChannel,
  d: EnquiryDetails,
): Promise<boolean> {
  const body = {
    type,
    channel,
    productId: d.product?.id,
    productName: d.product?.name,
    sku: d.product?.sku,
    color: d.color,
    size: d.size,
    measurements: Object.fromEntries(filled(d.measurements)),
    name: d.name,
    phone: d.phone,
    email: d.email,
    city: d.city,
    occasionDate: d.occasionDate,
    message: d.message,
    pageUrl: d.pageUrl ?? (typeof window !== 'undefined' ? window.location.href : undefined),
  };
  return fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  })
    // 202 + stored:false means the server can't persist yet — don't tell a form user it was sent.
    .then(async (r) => r.ok && (await r.json().catch(() => ({}))).stored !== false)
    .catch(() => false);
}

/**
 * Opens WhatsApp and logs the click-through. Call from a click handler so the
 * new tab isn't treated as a pop-up.
 */
export function openWhatsApp(type: InquiryType, message: string, d: EnquiryDetails) {
  void logInquiry(type, 'whatsapp', d);
  window.open(whatsappLink(message), '_blank', 'noopener,noreferrer');
}
