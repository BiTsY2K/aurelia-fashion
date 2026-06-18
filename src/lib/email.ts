import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';

/**
 * Queues a transactional email by writing to the `mail` collection.
 * The Firebase "Trigger Email from Firestore" extension picks these up and sends them.
 * Free to install; you supply an SMTP provider (Brevo/Resend/Gmail all have free tiers).
 */
export async function queueEmail(
  db: Firestore,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  if (!to) return;
  try {
    await db.collection('mail').add({
      to: [to],
      message: { subject, html },
      createdAt: new Date(),
    });
  } catch (err) {
    // Email must never break the order flow.
    console.error('queueEmail failed', err);
  }
}

const shell = (heading: string, body: string) => `
  <div style="font-family:Helvetica,Arial,sans-serif;background:#FAF7F2;padding:32px;color:#1A1A1A">
    <div style="max-width:520px;margin:0 auto;background:#FBF9F6;border-radius:16px;padding:32px">
      <p style="font-size:22px;letter-spacing:2px;margin:0 0 24px">Aurelia</p>
      <h1 style="font-size:20px;margin:0 0 12px;font-weight:600">${heading}</h1>
      ${body}
      <p style="font-size:12px;color:#6B6660;margin-top:28px">You're receiving this because you placed an order with Aurelia.</p>
    </div>
  </div>`;

export const orderConfirmationEmail = (orderId: string, total: string) =>
  shell(
    'Thank you for your order',
    `<p style="font-size:14px;line-height:1.6;color:#6B6660">
       We've received your order <strong style="color:#1A1A1A">#${orderId.slice(0, 8)}</strong>
       for <strong style="color:#1A1A1A">${total}</strong>. We're preparing your pieces now and
       will let you know the moment they ship.</p>`,
  );

export const orderShippedEmail = (orderId: string, trackingUrl?: string) =>
  shell(
    'Your order is on its way',
    `<p style="font-size:14px;line-height:1.6;color:#6B6660">
       Order <strong style="color:#1A1A1A">#${orderId.slice(0, 8)}</strong> has been dispatched.</p>
     ${
       trackingUrl
         ? `<a href="${trackingUrl}" style="display:inline-block;margin-top:12px;background:#1A1A1A;color:#FAF7F2;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:14px">Track your parcel</a>`
         : ''
     }`,
  );

export const orderDeliveredEmail = (orderId: string) =>
  shell(
    'Delivered — we hope you love it',
    `<p style="font-size:14px;line-height:1.6;color:#6B6660">
       Order <strong style="color:#1A1A1A">#${orderId.slice(0, 8)}</strong> has been delivered.
       If anything isn't quite right, just reply and we'll sort it out.</p>`,
  );
