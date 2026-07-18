'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminFetch, uploadProductImage } from '@/lib/admin-client';
import { SIZE_SETS, sizeSetFor, totalStock } from '@/lib/catalog';
import { formatPrice, cn } from '@/lib/utils';
import type { Category, Product, ProductStatus } from '@/types';

type Draft = Partial<Product>;

const EDITS = ['', 'bridal', 'festive', 'new'];
const STATUS_TONE: Record<ProductStatus, string> = {
  active: 'bg-[#25D366]/15 text-[#137a3a]',
  draft: 'bg-champagne/25 text-carbon',
  archived: 'bg-ivory-dim text-carbon-muted',
};

const blank = (): Draft => ({
  name: '', sku: '', slug: '', price: 0, currency: 'INR', description: '', designStory: '', fabric: '',
  category: 'women', subcategory: '', collection: '', tags: [], occasions: [], fabricCare: '',
  variants: [{ name: 'Default', hex: '#C8A96A', images: [] }],
  sizesStock: { Default: {} },
  customizable: true, madeToOrder: false, leadTimeDays: 7, status: 'draft', featured: false,
});

const field = 'h-10 w-full rounded-xl border border-line bg-ivory px-3 text-sm outline-none focus:border-carbon';

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-carbon-muted">{label}</span>
      <input {...props} className={field} />
    </label>
  );
}

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 accent-carbon" />
      <span>{label}{hint && <span className="block text-[11px] text-carbon-muted">{hint}</span>}</span>
    </label>
  );
}

const list = (v: string) => v.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [status, setStatus] = useState({ error: '', note: '', busy: false });
  const [filter, setFilter] = useState<ProductStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState(false);

  const load = () =>
    adminFetch<{ products: Product[] }>('/api/admin/products')
      .then((d) => setProducts(d.products))
      .catch((e) => setStatus((s) => ({ ...s, error: e.message })))
      .finally(() => setLoaded(true));

  useEffect(() => {
    load();
    adminFetch<{ categories: Category[] }>('/api/admin/categories')
      .then((d) => setCategories(d.categories))
      .catch(() => {});
  }, []);

  const departments = categories.filter((c) => c.parentId === null).sort((a, b) => a.order - b.order);
  const deptOf = (slug?: string) => departments.find((d) => d.slug === slug);
  const subsOf = (slug?: string) => {
    const dept = deptOf(slug);
    return dept ? categories.filter((c) => c.parentId === dept.id).sort((a, b) => a.order - b.order) : [];
  };
  const catName = (slug?: string) => categories.find((c) => c.slug === slug)?.name ?? slug ?? '—';

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => filter === 'all' || (p.status ?? 'active') === filter)
      .filter((p) => !q || [p.name, p.sku, p.subcategory, ...(p.tags ?? [])].join(' ').toLowerCase().includes(q))
      .sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0));
  }, [products, filter, search]);

  const set = <K extends keyof Product>(key: K, value: Product[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  // The size matrix follows the department's size chart (women / kids / men).
  const draftSizes = draft
    ? SIZE_SETS[deptOf(draft.category)?.sizeSet ?? sizeSetFor({ category: draft.category ?? 'women' })]
    : [];

  const setStock = (color: string, size: string, qty: number) =>
    setDraft((d) => d && ({
      ...d,
      sizesStock: { ...d.sizesStock, [color]: { ...(d.sizesStock?.[color] ?? {}), [size]: Math.max(0, qty) } },
    }));

  const updateVariant = (i: number, patch: Partial<Product['variants'][number]>) =>
    setDraft((d) => {
      if (!d?.variants) return d;
      const variants = [...d.variants];
      variants[i] = { ...variants[i], ...patch };
      return { ...d, variants };
    });

  const save = async () => {
    if (!draft) return;
    setStatus({ error: '', note: '', busy: true });
    try {
      // Drop stock rows for colours that no longer exist, and sizes outside this department's chart.
      const names = new Set((draft.variants ?? []).map((v) => v.name));
      const sizesStock = Object.fromEntries(
        Object.entries(draft.sizesStock ?? {})
          .filter(([color]) => names.has(color))
          .map(([color, sizes]) => [color, Object.fromEntries(Object.entries(sizes).filter(([s]) => draftSizes.includes(s)))]),
      );
      await adminFetch('/api/admin/products', { method: 'POST', body: JSON.stringify({ ...draft, sizesStock }) });
      setStatus({ error: '', note: `“${draft.name}” saved.`, busy: false });
      setDraft(null);
      load();
    } catch (e) {
      setStatus({ error: (e as Error).message, note: '', busy: false });
    }
  };

  const setProductStatus = async (p: Product, next: ProductStatus) => {
    try {
      await adminFetch('/api/admin/products', { method: 'PATCH', body: JSON.stringify({ id: p.id, status: next }) });
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, status: next } : x)));
    } catch (e) {
      setStatus((s) => ({ ...s, error: (e as Error).message }));
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete “${p.name}” permanently? Archiving hides it but keeps its history.`)) return;
    try {
      await adminFetch(`/api/admin/products?id=${p.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setStatus((s) => ({ ...s, error: (e as Error).message }));
    }
  };

  const importDemo = async () => {
    setStatus({ error: '', note: '', busy: true });
    try {
      const r = await adminFetch<{ count: number }>('/api/admin/products', { method: 'POST', body: JSON.stringify({ action: 'seed-demo' }) });
      setStatus({ error: '', note: `Imported ${r.count} demo pieces. Replace their photos and details as you go.`, busy: false });
      load();
    } catch (e) {
      setStatus({ error: (e as Error).message, note: '', busy: false });
    }
  };

  const upload = async (files: FileList, colorIdx: number) => {
    setStatus((s) => ({ ...s, busy: true, error: '' }));
    try {
      const urls = await Promise.all([...files].map(uploadProductImage));
      setDraft((d) => {
        if (!d?.variants) return d;
        const variants = [...d.variants];
        variants[colorIdx] = { ...variants[colorIdx], images: [...variants[colorIdx].images, ...urls] };
        return { ...d, variants };
      });
      setStatus((s) => ({ ...s, busy: false }));
    } catch (e) {
      setStatus({ error: (e as Error).message, note: '', busy: false });
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-display-md">Products</h1>
        <button onClick={() => { setDraft(blank()); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-pill">Add product</button>
      </div>

      {status.error && <p className="mt-4 text-sm text-terracotta">{status.error}</p>}
      {status.note && <p className="mt-4 text-sm text-carbon-muted">{status.note}</p>}

      {/* Editor */}
      {draft && (
        <div className="mt-6 rounded-card border border-line bg-ivory-soft p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">{draft.id ? `Edit ${draft.name}` : 'New product'}</h2>
            <button onClick={() => setDraft(null)} className="text-xs text-carbon-muted underline">Cancel</button>
          </div>

          <p className="eyebrow mt-6">Basics</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Name" value={draft.name ?? ''} onChange={(e) => set('name', e.target.value)} />
            <Input label="SKU (blank = auto)" value={draft.sku ?? ''} onChange={(e) => set('sku', e.target.value.toUpperCase())} placeholder="AUR-LEH-004" />
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-carbon-muted">Status</span>
              <select value={draft.status ?? 'active'} onChange={(e) => set('status', e.target.value as ProductStatus)} className={field}>
                <option value="active">Active — visible in store</option>
                <option value="draft">Draft — hidden</option>
                <option value="archived">Archived — hidden</option>
              </select>
            </label>
            <Input label="Price (₹)" type="number" min={0} value={draft.price ?? 0} onChange={(e) => set('price', Number(e.target.value))} />
            <Input label="Compare-at price (₹, optional)" type="number" min={0} value={draft.compareAtPrice ?? ''}
              onChange={(e) => set('compareAtPrice', e.target.value ? Number(e.target.value) : undefined)} />
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-carbon-muted">Edit / collection</span>
              <select value={draft.collection ?? ''} onChange={(e) => set('collection', e.target.value || undefined)} className={cn(field, 'capitalize')}>
                {EDITS.map((c) => <option key={c} value={c}>{c || '— none —'}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-carbon-muted">Department</span>
              <select value={draft.category ?? ''} onChange={(e) => setDraft({ ...draft, category: e.target.value, subcategory: '' })} className={field}>
                {departments.map((d) => <option key={d.id} value={d.slug}>{d.name}{d.active ? '' : ' (hidden)'}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-carbon-muted">Sub-category</span>
              <select value={draft.subcategory ?? ''} onChange={(e) => set('subcategory', e.target.value)} className={field}>
                <option value="">Choose…</option>
                {subsOf(draft.category).map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </label>
            <Input label="Lead time (days)" type="number" min={0} value={draft.leadTimeDays ?? ''}
              onChange={(e) => set('leadTimeDays', e.target.value ? Number(e.target.value) : undefined)} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Toggle label="Custom fit" hint="Shows the measurements form" checked={Boolean(draft.customizable)} onChange={(v) => set('customizable', v)} />
            <Toggle label="Made to order" hint="No stock needed; always orderable" checked={Boolean(draft.madeToOrder)} onChange={(v) => set('madeToOrder', v)} />
            <Toggle label="Featured" hint="Prioritised on the homepage" checked={Boolean(draft.featured)} onChange={(v) => set('featured', v)} />
          </div>

          <p className="eyebrow mt-8">Story & details</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-carbon-muted">Short description</span>
              <textarea rows={2} value={draft.description ?? ''} onChange={(e) => set('description', e.target.value)}
                className="w-full rounded-xl border border-line bg-ivory p-3 text-sm outline-none focus:border-carbon" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-carbon-muted">Design story</span>
              <textarea rows={3} value={draft.designStory ?? ''} onChange={(e) => set('designStory', e.target.value)}
                placeholder="Inspiration, artisans, technique, hours of work…"
                className="w-full rounded-xl border border-line bg-ivory p-3 text-sm outline-none focus:border-carbon" />
            </label>
            <Input label="Fabric & work" value={draft.fabric ?? ''} onChange={(e) => set('fabric', e.target.value)} placeholder="Raw silk with zardozi" />
            <Input label="Care" value={draft.fabricCare ?? ''} onChange={(e) => set('fabricCare', e.target.value)} placeholder="Dry clean only" />
            <Input label="Occasions (comma separated)" value={(draft.occasions ?? []).join(', ')}
              onChange={(e) => set('occasions', list(e.target.value))} placeholder="wedding, festive, reception" />
            <Input label="Tags (comma separated)" value={(draft.tags ?? []).join(', ')}
              onChange={(e) => set('tags', list(e.target.value))} placeholder="lehenga, red, zardozi, bridal" />
          </div>

          {/* Colour variants + stock matrix */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Colours, photos & stock</p>
              <button
                onClick={() => setDraft((d) => d && ({
                  ...d,
                  variants: [...(d.variants ?? []), { name: `Colour ${(d.variants?.length ?? 0) + 1}`, hex: '#CCCCCC', images: [] }],
                }))}
                className="text-xs underline">Add colour</button>
            </div>

            {(draft.variants ?? []).map((v, i) => (
              <div key={i} className="mt-3 rounded-xl border border-line bg-ivory p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <Input label="Colour name" value={v.name}
                    onChange={(e) => setDraft((d) => {
                      if (!d?.variants) return d;
                      const variants = [...d.variants];
                      const oldName = variants[i].name;
                      variants[i] = { ...variants[i], name: e.target.value };
                      const stock = { ...d.sizesStock };
                      stock[e.target.value] = stock[oldName] ?? {};
                      delete stock[oldName];
                      return { ...d, variants, sizesStock: stock };
                    })} />
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-carbon-muted">Swatch</span>
                    <input type="color" value={v.hex} onChange={(e) => updateVariant(i, { hex: e.target.value })}
                      className="h-10 w-14 rounded-lg border border-line bg-ivory" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-carbon-muted">Upload photos</span>
                    <input type="file" accept="image/*" multiple
                      onChange={(e) => e.target.files?.length && upload(e.target.files, i)}
                      className="text-xs text-carbon-muted file:mr-2 file:rounded-pill file:border-0 file:bg-carbon file:px-3 file:py-1.5 file:text-xs file:text-ivory" />
                  </label>
                  {(draft.variants?.length ?? 0) > 1 && (
                    <button onClick={() => setDraft((d) => d && ({ ...d, variants: d.variants!.filter((_, j) => j !== i) }))}
                      className="mb-2 text-xs text-terracotta underline">Remove colour</button>
                  )}
                </div>

                {v.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {v.images.map((src, j) => (
                      <div key={src} className="group relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className={cn('h-20 w-16 rounded object-cover', j === 0 && 'ring-2 ring-champagne')} />
                        <div className="absolute inset-x-0 bottom-0 flex justify-between bg-carbon/70 px-1 text-[10px] text-ivory opacity-0 transition group-hover:opacity-100">
                          {j > 0 ? (
                            <button onClick={() => updateVariant(i, { images: [src, ...v.images.filter((x) => x !== src)] })} title="Make cover">★</button>
                          ) : <span>cover</span>}
                          <button onClick={() => updateVariant(i, { images: v.images.filter((x) => x !== src) })} title="Remove">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {draft.madeToOrder ? (
                  <p className="mt-4 text-xs text-carbon-muted">Made to order — stock isn’t tracked for this piece.</p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {draftSizes.map((s) => (
                      <label key={s} className="text-center">
                        <span className="mb-1 block text-xs text-carbon-muted">{s}</span>
                        <input type="number" min={0} value={draft.sizesStock?.[v.name]?.[s] ?? 0}
                          onChange={(e) => setStock(v.name, s, Number(e.target.value))}
                          className="h-9 w-16 rounded-lg border border-line bg-ivory px-2 text-center text-sm outline-none focus:border-carbon" />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={save} disabled={status.busy} className="btn-pill mt-6 disabled:opacity-50">
            {status.busy ? 'Saving…' : 'Save product'}
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {(['all', 'active', 'draft', 'archived'] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn('rounded-pill px-3.5 py-1.5 text-xs capitalize', filter === s ? 'bg-carbon text-ivory' : 'bg-ivory-dim text-carbon-muted')}>
            {s} ({s === 'all' ? products.length : products.filter((p) => (p.status ?? 'active') === s).length})
          </button>
        ))}
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, SKU, tag…" aria-label="Search products"
          className="ml-auto h-9 w-full rounded-pill border border-line bg-ivory px-4 text-sm outline-none focus:border-carbon sm:w-64" />
      </div>

      {/* Inventory table */}
      <div className="mt-4 overflow-x-auto">
        {loaded && products.length === 0 ? (
          <div className="rounded-card bg-ivory-soft p-8 text-center">
            <p className="text-sm text-carbon-muted">No products in Firestore yet — the storefront is showing the built-in demo catalog.</p>
            <button onClick={importDemo} disabled={status.busy} className="btn-pill mt-4 disabled:opacity-50">Import the demo catalog</button>
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-carbon-muted">
                <th className="py-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((p) => {
                const stock = totalStock(p);
                const st = p.status ?? 'active';
                return (
                  <tr key={p.id}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.variants?.[0]?.images[0] ? <img src={p.variants[0].images[0]} alt="" className="h-12 w-10 rounded object-cover" /> : <span className="h-12 w-10 rounded bg-ivory-dim" />}
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-carbon-muted">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-carbon-muted">{catName(p.category)} › {catName(p.subcategory)}</td>
                    <td>{formatPrice(p.price, p.currency)}</td>
                    <td className={cn(!p.madeToOrder && stock === 0 && 'text-terracotta', !p.madeToOrder && stock > 0 && stock <= 5 && 'text-champagne-deep')}>
                      {p.madeToOrder ? 'Made to order' : stock === 0 ? 'Sold out' : stock}
                    </td>
                    <td><span className={cn('rounded-pill px-2.5 py-1 text-[11px] capitalize', STATUS_TONE[st])}>{st}</span></td>
                    <td className="whitespace-nowrap text-right">
                      <button onClick={() => { setDraft(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mr-3 text-xs underline">Edit</button>
                      {st === 'archived'
                        ? <button onClick={() => setProductStatus(p, 'active')} className="mr-3 text-xs underline">Restore</button>
                        : <button onClick={() => setProductStatus(p, 'archived')} className="mr-3 text-xs underline">Archive</button>}
                      <button onClick={() => remove(p)} className="text-xs text-terracotta underline">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
