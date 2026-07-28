import type { Metadata } from 'next';
import InquiryForm from '@/components/forms/InquiryForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reach the Aurelia atelier on WhatsApp or by message — styling help, orders, alterations and appointments.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 text-display-lg">We’d love to hear from you.</h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-carbon-muted">
            The fastest way to reach us is WhatsApp — our stylists reply 10am to 8pm, Monday to Saturday.
            For fittings, book an appointment and we’ll share the atelier address.
          </p>
          <dl className="mt-8 space-y-4 text-sm">
            <div><dt className="eyebrow">Appointments</dt><dd className="mt-1">By booking only — message us to schedule a fitting.</dd></div>
            <div><dt className="eyebrow">Orders & alterations</dt><dd className="mt-1">Quote your order number or the product SKU.</dd></div>
          </dl>
        </div>
        <div className="rounded-[28px] border border-line bg-ivory-soft p-6 md:p-8">
          <InquiryForm variant="contact" />
        </div>
      </div>
    </section>
  );
}
