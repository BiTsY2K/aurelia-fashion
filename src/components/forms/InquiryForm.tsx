'use client';

import { useState } from 'react';
import MeasurementFields from '@/components/product/MeasurementFields';
import { WhatsAppGlyph } from '@/components/layout/Concierge';
import { bespokeMessage, logInquiry, openWhatsApp } from '@/lib/enquiry';
import { cn } from '@/lib/utils';
import type { Measurements, SizeSetId } from '@/types';

const GARMENTS = ['Bridal lehenga', 'Saree & blouse', 'Gown', 'Indo-Western set', 'Anarkali / suit', 'Girls’ ethnic wear', 'Girls’ party dress', 'Something else'];
const BUDGETS = ['Under ₹15,000', '₹15,000 – ₹40,000', '₹40,000 – ₹1,00,000', 'Above ₹1,00,000'];

/**
 * On-site enquiry form. `bespoke` adds garment, budget and measurements.
 * Submissions are logged to the admin inquiry tracker; the customer can also
 * hand the same details straight to WhatsApp.
 */
export default function InquiryForm({ variant }: { variant: 'bespoke' | 'contact' }) {
  const bespoke = variant === 'bespoke';
  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: '', occasionDate: '', message: '', garment: '', budget: '',
  });
  const [forWhom, setForWhom] = useState<SizeSetId>('women');
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [state, setState] = useState<{ status: 'idle' | 'sending' | 'sent' | 'error'; message?: string }>({ status: 'idle' });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const details = () => ({
    ...form,
    message: [bespoke && form.garment && `Garment: ${form.garment}`, bespoke && form.budget && `Budget: ${form.budget}`, form.message]
      .filter(Boolean).join('\n'),
    measurements: showMeasurements ? measurements : undefined,
  });

  const validate = () => {
    if (!form.name.trim()) return 'Please tell us your name.';
    if (!form.phone.trim() && !form.email.trim()) return 'Add a phone number or email so we can reply.';
    if (!form.message.trim() && !(bespoke && form.garment)) return 'Tell us a little about what you have in mind.';
    return '';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) { setState({ status: 'error', message: problem }); return; }
    setState({ status: 'sending' });
    const ok = await logInquiry(bespoke ? 'bespoke' : 'contact', 'form', details());
    setState(ok
      ? { status: 'sent' }
      : { status: 'error', message: 'We couldn’t send that just now — please use WhatsApp instead.' });
  };

  const viaWhatsApp = () => {
    const problem = validate();
    if (problem) { setState({ status: 'error', message: problem }); return; }
    const d = details();
    const message = bespoke
      ? bespokeMessage({ ...d, garment: form.garment, budget: form.budget })
      : `Hi Aurelia! ${form.message}\n\n— ${form.name}${form.city ? `, ${form.city}` : ''}`;
    openWhatsApp(bespoke ? 'bespoke' : 'contact', message, d);
  };

  if (state.status === 'sent') {
    return (
      <div className="rounded-card bg-blush-soft p-10 text-center">
        <p className="font-display text-3xl">Thank you, {form.name.split(' ')[0]}.</p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-carbon-muted">
          Your {bespoke ? 'design request' : 'message'} is with our team. We’ll be in touch within one working day
          {form.phone ? ' on WhatsApp' : ' by email'}.
        </p>
        <button onClick={viaWhatsApp} className="btn-pill-ghost mt-6">
          <span className="text-[#25D366]"><WhatsAppGlyph size={16} /></span> Can’t wait? Chat now
        </button>
      </div>
    );
  }

  const field = 'h-11 w-full rounded-xl border border-line bg-ivory px-3.5 text-sm outline-none focus:border-carbon';
  const label = 'mb-1 block text-xs font-medium text-carbon-muted';

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-4" noValidate>
      <label className="col-span-2 block sm:col-span-1"><span className={label}>Full name *</span>
        <input value={form.name} onChange={set('name')} autoComplete="name" className={field} /></label>
      <label className="col-span-2 block sm:col-span-1"><span className={label}>WhatsApp number</span>
        <input value={form.phone} onChange={set('phone')} type="tel" autoComplete="tel" placeholder="+91" className={field} /></label>
      <label className="col-span-2 block sm:col-span-1"><span className={label}>Email</span>
        <input value={form.email} onChange={set('email')} type="email" autoComplete="email" className={field} /></label>
      <label className="col-span-2 block sm:col-span-1"><span className={label}>City</span>
        <input value={form.city} onChange={set('city')} autoComplete="address-level2" className={field} /></label>

      {bespoke && (
        <>
          <label className="col-span-2 block sm:col-span-1"><span className={label}>What would you like made?</span>
            <select value={form.garment} onChange={set('garment')} className={field}>
              <option value="">Choose a garment</option>
              {GARMENTS.map((g) => <option key={g}>{g}</option>)}
            </select></label>
          <label className="col-span-2 block sm:col-span-1"><span className={label}>Budget</span>
            <select value={form.budget} onChange={set('budget')} className={field}>
              <option value="">Prefer to discuss</option>
              {BUDGETS.map((b) => <option key={b}>{b}</option>)}
            </select></label>
          <label className="col-span-2 block"><span className={label}>Event date</span>
            <input value={form.occasionDate} onChange={set('occasionDate')} type="date" className={field} /></label>
        </>
      )}

      <label className="col-span-2 block"><span className={label}>{bespoke ? 'Describe your dream piece' : 'Your message'}</span>
        <textarea value={form.message} onChange={set('message')} rows={5}
          placeholder={bespoke ? 'Colours, fabric, embroidery, silhouette, the feeling you want — and links to any references.' : 'How can we help?'}
          className="w-full rounded-xl border border-line bg-ivory p-3.5 text-sm outline-none focus:border-carbon" /></label>

      {bespoke && (
        <div className="col-span-2 rounded-xl border border-line bg-ivory-soft p-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={showMeasurements} onChange={(e) => setShowMeasurements(e.target.checked)} className="accent-carbon" />
            I have my measurements ready
          </label>
          {showMeasurements && (
            <div className="mt-4">
              <div className="mb-4 inline-flex rounded-pill border border-line p-1 text-xs">
                {(['women', 'kids'] as SizeSetId[]).map((s) => (
                  <button type="button" key={s} onClick={() => { setForWhom(s); setMeasurements({}); }}
                    className={cn('rounded-pill px-4 py-1.5', forWhom === s ? 'bg-carbon text-ivory' : 'text-carbon-muted')}>
                    {s === 'women' ? 'For me' : 'For my daughter'}
                  </button>
                ))}
              </div>
              <MeasurementFields set={forWhom} value={measurements} onChange={setMeasurements} />
            </div>
          )}
        </div>
      )}

      {state.status === 'error' && <p className="col-span-2 text-sm text-terracotta" role="alert">{state.message}</p>}

      <div className="col-span-2 flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={state.status === 'sending'} className="btn-pill flex-1 justify-center disabled:opacity-50">
          {state.status === 'sending' ? 'Sending…' : bespoke ? 'Send design request' : 'Send message'}
        </button>
        <button type="button" onClick={viaWhatsApp}
          className="flex flex-1 items-center justify-center gap-2 rounded-pill bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.01]">
          <WhatsAppGlyph /> Send on WhatsApp
        </button>
      </div>
    </form>
  );
}
