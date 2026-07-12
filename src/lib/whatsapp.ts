import 'server-only';

/**
 * Sends a WhatsApp message via the WhatsApp Business Cloud API.
 * Returns false (rather than throwing) when unconfigured, so callers can
 * degrade gracefully — a missing integration must never break an order.
 *
 * Note: outside the 24-hour customer-service window, Meta only permits
 * pre-approved template messages. Set WHATSAPP_TEMPLATE_NAME once yours is approved.
 */
export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID);
}

export async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  if (!isWhatsAppConfigured() || !to) return false;

  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const recipient = to.replace(/[^0-9]/g, '');

  const payload = template
    ? {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'template',
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG ?? 'en' },
          components: [{ type: 'body', parameters: [{ type: 'text', text: body }] }],
        },
      }
    : {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: { body },
      };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('sendWhatsApp failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('sendWhatsApp error', err);
    return false;
  }
}

export function abandonedCartMessage(name: string, itemName: string, code: string, url: string) {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  return `${greeting} your ${itemName} is still waiting in your Aurelia cart. Here's 5% off if you finish up today — use code ${code}. ${url}`;
}

export function dispatchMessage(orderId: string, trackingUrl?: string) {
  return `Your Aurelia order #${orderId.slice(0, 8)} has been dispatched.${
    trackingUrl ? ` Track it here: ${trackingUrl}` : ''
  }`;
}

export function deliveryFeedbackMessage(orderId: string) {
  return `Your Aurelia order #${orderId.slice(0, 8)} arrived a few days ago — how did it fit? Reply here and our stylist will help with anything you need.`;
}
