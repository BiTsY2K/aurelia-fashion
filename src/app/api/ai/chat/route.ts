import { NextResponse } from 'next/server';
import { getAIProvider, isAIConfigured, type ChatMessage } from '@/lib/ai/provider';
import { clientKey, rateLimited } from '@/lib/analytics-server';
import { getProducts } from '@/lib/products';
import { formatPrice, siteUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Grounds the assistant in the live catalog so it recommends real pieces with real prices. */
async function systemPrompt(): Promise<string> {
  const products = await getProducts();
  const catalog = products
    .slice(0, 60)
    .map((p) => `- ${p.name} (SKU ${p.sku}, ${p.subcategory}, ${formatPrice(p.price, p.currency)}${p.madeToOrder ? ', made to order' : ''}) — ${siteUrl()}/product/${p.slug}`)
    .join('\n');

  return [
    'You are the Aurelia stylist, a warm and concise concierge for a luxury couture boutique selling',
    'women’s sarees, lehengas, gowns and Indo-Western wear, and girls’ ethnic wear, frocks and party wear.',
    'Every piece can be tailored to the customer’s measurements.',
    'Recommend at most three pieces from the catalog below, by name and link. Never invent products or prices.',
    'For orders, measurements, delivery dates or anything you are unsure of, suggest the customer',
    'tap "Continue on WhatsApp" to reach the boutique team. Keep replies under 120 words.',
    '',
    'Catalog:',
    catalog,
  ].join('\n');
}

/** Lets the concierge know whether to offer the AI chat or route straight to WhatsApp. */
export async function GET() {
  return NextResponse.json({ configured: isAIConfigured() });
}

export async function POST(req: Request) {
  const provider = getAIProvider();
  if (!provider) {
    return NextResponse.json(
      { error: 'The AI stylist is coming soon. Our team is on WhatsApp in the meantime.', configured: false },
      { status: 503 },
    );
  }

  if (rateLimited(`ai:${clientKey(req)}`, 15)) {
    return NextResponse.json({ error: 'Let’s slow down a little — try again in a minute.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const history: ChatMessage[] = Array.isArray(body.messages)
    ? body.messages
        .filter((m: ChatMessage) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-10)
        .map((m: ChatMessage) => ({ role: m.role, content: m.content.slice(0, 1000) }))
    : [];

  if (!history.length || history.at(-1)?.role !== 'user') {
    return NextResponse.json({ error: 'Ask me anything about our collections.' }, { status: 400 });
  }

  try {
    const reply = await provider.chat([{ role: 'system', content: await systemPrompt() }, ...history]);
    return NextResponse.json({ reply, configured: true });
  } catch (err) {
    console.error('ai/chat', err);
    return NextResponse.json({ error: 'The stylist is unavailable right now. Try WhatsApp instead.' }, { status: 502 });
  }
}
