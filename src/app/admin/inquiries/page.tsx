'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';
import { cn } from '@/lib/utils';
import type { Inquiry, InquiryStatus, InquiryType } from '@/types';

const STATUSES: InquiryStatus[] = ['new', 'contacted', 'converted', 'closed'];
const TYPES: (InquiryType | 'all')[] = ['all', 'order', 'enquiry', 'bespoke', 'contact'];

const STATUS_TONE: Record<InquiryStatus, string> = {
  new: 'bg-rose text-ivory',
  contacted: 'bg-champagne text-carbon',
  converted: 'bg-carbon text-ivory',
  closed: 'bg-ivory-dim text-carbon-muted',
};

const when = (ms: number) =>
  new Date(ms).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** wa.me link to reply to the customer directly from the dashboard. */
const replyLink = (i: Inquiry) => {
  const digits = (i.phone ?? '').replace(/[^0-9]/g, '');
  if (digits.length < 8) return null;
  const number = digits.length === 10 ? `91${digits}` : digits; // assume India for bare 10-digit numbers
  const text = `Hi ${i.name?.split(' ')[0] ?? ''}, this is Aurelia${i.productName ? ` about the ${i.productName}` : ''}. `;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

export default function AdminInquiries() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState<InquiryType | 'all'>('all');
  const [status, setStatus] = useState<InquiryStatus | 'all'>('all');
  const [open, setOpen] = useState<string | null>(null);

  const load = () =>
    adminFetch<{ inquiries: Inquiry[] }>('/api/admin/inquiries')
      .then((d) => setItems(d.inquiries))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const visible = useMemo(
    () => items.filter((i) => (type === 'all' || i.type === type) && (status === 'all' || i.status === status)),
    [items, type, status],
  );

  const counts = useMemo(
    () => Object.fromEntries(STATUSES.map((s) => [s, items.filter((i) => i.status === s).length])),
    [items],
  );

  const updateStatus = async (id: string, next: InquiryStatus) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, status: next } : i))); // optimistic
    try {
      await adminFetch('/api/admin/inquiries', { method: 'PATCH', body: JSON.stringify({ id, status: next }) });
    } catch (e) {
      setError((e as Error).message);
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this inquiry permanently?')) return;
    try {
      await adminFetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE' });
      setItems((list) => list.filter((i) => i.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-display-md">Inquiries</h1>
      <p className="mt-1 text-sm text-carbon-muted">WhatsApp click-throughs and on-site forms, newest first.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['all', ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={cn('rounded-pill px-3.5 py-1.5 text-xs capitalize transition-colors',
              status === s ? 'bg-carbon text-ivory' : 'bg-ivory-dim text-carbon-muted hover:text-carbon')}>
            {s}{s !== 'all' && ` (${counts[s] ?? 0})`}
          </button>
        ))}
        <select value={type} onChange={(e) => setType(e.target.value as InquiryType | 'all')}
          className="ml-auto rounded-pill border border-line bg-ivory px-3 py-1.5 text-xs capitalize outline-none" aria-label="Filter by type">
          {TYPES.map((t) => <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>)}
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-terracotta">{error}</p>}

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-carbon-muted">Loading…</p>}
        {!loading && visible.length === 0 && (
          <p className="rounded-card bg-ivory-soft p-8 text-center text-sm text-carbon-muted">
            No inquiries here yet. They appear the moment a shopper taps a WhatsApp button or sends a form.
          </p>
        )}
        {visible.map((i) => {
          const reply = replyLink(i);
          const expanded = open === i.id;
          return (
            <article key={i.id} className="rounded-card border border-line bg-ivory-soft p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button onClick={() => setOpen(expanded ? null : i.id)} className="min-w-0 flex-1 text-left" aria-expanded={expanded}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('rounded-pill px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', STATUS_TONE[i.status])}>{i.status}</span>
                    <span className="rounded-pill bg-ivory px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-carbon-muted">
                      {i.type} · {i.channel === 'whatsapp' ? 'WhatsApp' : 'Form'}
                    </span>
                    <span className="text-xs text-carbon-muted">{when(i.createdAt)}</span>
                  </div>
                  <p className="mt-2 font-medium">
                    {i.name ?? 'Anonymous shopper'}
                    {i.productName && <span className="font-normal text-carbon-muted"> · {i.productName}{i.sku && ` (${i.sku})`}</span>}
                  </p>
                  {i.message && !expanded && <p className="mt-1 line-clamp-1 text-sm text-carbon-muted">{i.message}</p>}
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <select value={i.status} onChange={(e) => updateStatus(i.id, e.target.value as InquiryStatus)}
                    className="rounded-pill border border-line bg-ivory px-2.5 py-1.5 text-xs capitalize outline-none" aria-label="Status">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {reply && (
                    <a href={reply} target="_blank" rel="noopener noreferrer" onClick={() => i.status === 'new' && updateStatus(i.id, 'contacted')}
                      className="rounded-pill bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white">Reply</a>
                  )}
                </div>
              </div>

              {expanded && (
                <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-line pt-4 text-sm sm:grid-cols-2">
                  {[
                    ['Phone', i.phone], ['Email', i.email], ['City', i.city], ['Needed by', i.occasionDate],
                    ['Colour', i.color], ['Size', i.size],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex gap-2"><dt className="w-24 shrink-0 text-carbon-muted">{k}</dt><dd className="break-all">{v}</dd></div>
                  ))}
                  {i.measurements && Object.keys(i.measurements).length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-carbon-muted">Measurements (in)</dt>
                      <dd className="mt-1 flex flex-wrap gap-2">
                        {Object.entries(i.measurements).map(([k, v]) => (
                          <span key={k} className="rounded-pill bg-ivory px-2.5 py-1 text-xs">{k}: {v}</span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {i.message && <div className="sm:col-span-2"><dt className="text-carbon-muted">Message</dt><dd className="mt-1 whitespace-pre-line">{i.message}</dd></div>}
                  {i.pageUrl && <div className="sm:col-span-2"><dt className="text-carbon-muted">From page</dt><dd className="mt-1 truncate"><a href={i.pageUrl} target="_blank" rel="noopener noreferrer" className="underline">{i.pageUrl}</a></dd></div>}
                  <div className="sm:col-span-2">
                    <button onClick={() => remove(i.id)} className="text-xs text-terracotta underline">Delete inquiry</button>
                  </div>
                </dl>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
