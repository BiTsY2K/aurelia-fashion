'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { WhatsAppGlyph } from '@/components/layout/Concierge';
import { useAuth } from '@/context/auth-provider';
import { openWhatsApp, orderMessage, type EnquiryDetails } from '@/lib/enquiry';
import { formatPrice } from '@/lib/utils';

const STORAGE_KEY = 'aurelia-contact';

interface Contact { name: string; phone: string; email: string; city: string }

function loadContact(): Partial<Contact> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

/**
 * "Order via WhatsApp": collects the few details the atelier needs, then opens a
 * chat with everything pre-filled — product, SKU, size or measurements, contact
 * details and the page link. Details are remembered on this device for next time.
 */
export default function WhatsAppOrderDialog({
  open,
  onClose,
  details,
}: {
  open: boolean;
  onClose: () => void;
  details: EnquiryDetails;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState<Contact & { occasionDate: string; message: string }>({
    name: '', phone: '', email: '', city: '', occasionDate: '', message: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const saved = loadContact();
    setForm((f) => ({
      ...f,
      name: f.name || saved.name || user?.displayName || '',
      phone: f.phone || saved.phone || user?.phoneNumber || '',
      email: f.email || saved.email || user?.email || '',
      city: f.city || saved.city || '',
    }));
  }, [open, user]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.phone.replace(/[^0-9]/g, '').length < 8) {
      setError('Please add your name and a phone number we can reach you on.');
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: form.name, phone: form.phone, email: form.email, city: form.city }));
    } catch { /* private mode — fine */ }

    const full: EnquiryDetails = { ...details, ...form };
    openWhatsApp('order', orderMessage(full), full);
    onClose();
  };

  const p = details.product;
  const sizeLabel = details.measurements && Object.values(details.measurements).some(Boolean)
    ? 'Custom measurements'
    : details.size ?? 'Size to be confirmed';

  const field = 'h-11 w-full rounded-xl border border-line bg-ivory px-3.5 text-sm outline-none focus:border-carbon';

  return (
    <Modal open={open} onClose={onClose} title="Order via WhatsApp">
      {p && (
        <div className="mb-5 rounded-xl bg-blush-soft p-4 text-sm">
          <p className="font-medium">{p.name}</p>
          <p className="mt-0.5 text-xs text-carbon-muted">
            SKU {p.sku} · {details.color} · {sizeLabel} · {formatPrice(p.price, p.currency)}
          </p>
        </div>
      )}
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <label className="col-span-2 block sm:col-span-1">
          <span className="mb-1 block text-xs font-medium text-carbon-muted">Full name *</span>
          <input value={form.name} onChange={set('name')} autoComplete="name" className={field} />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="mb-1 block text-xs font-medium text-carbon-muted">WhatsApp number *</span>
          <input value={form.phone} onChange={set('phone')} type="tel" autoComplete="tel" placeholder="+91" className={field} />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="mb-1 block text-xs font-medium text-carbon-muted">Email</span>
          <input value={form.email} onChange={set('email')} type="email" autoComplete="email" className={field} />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="mb-1 block text-xs font-medium text-carbon-muted">City</span>
          <input value={form.city} onChange={set('city')} autoComplete="address-level2" className={field} />
        </label>
        <label className="col-span-2 block">
          <span className="mb-1 block text-xs font-medium text-carbon-muted">Needed by (event date)</span>
          <input value={form.occasionDate} onChange={set('occasionDate')} type="date" className={field} />
        </label>
        <label className="col-span-2 block">
          <span className="mb-1 block text-xs font-medium text-carbon-muted">Anything we should know?</span>
          <textarea value={form.message} onChange={set('message')} rows={3}
            placeholder="Colour changes, sleeve style, blouse design, a reference photo you'll share…"
            className="w-full rounded-xl border border-line bg-ivory p-3.5 text-sm outline-none focus:border-carbon" />
        </label>
        {error && <p className="col-span-2 text-xs text-terracotta">{error}</p>}
        <button type="submit"
          className="col-span-2 mt-1 flex items-center justify-center gap-2 rounded-pill bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.01]">
          <WhatsAppGlyph /> Send order on WhatsApp
        </button>
        <p className="col-span-2 text-center text-[11px] text-carbon-muted">
          Opens WhatsApp with your order pre-filled. Nothing is charged until we confirm details with you.
        </p>
      </form>
    </Modal>
  );
}
