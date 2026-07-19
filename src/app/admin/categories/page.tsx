'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminFetch, uploadProductImage } from '@/lib/admin-client';
import { buildTree } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import type { Category, CategoryNode, SizeSetId } from '@/types';

const blank = (parentId: string | null = null): Partial<Category> => ({
  name: '', slug: '', parentId, description: '', image: '', order: 99, active: true,
  ...(parentId ? {} : { sizeSet: 'women' as SizeSetId }),
});

const field = 'h-10 w-full rounded-xl border border-line bg-ivory px-3 text-sm outline-none focus:border-carbon';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [seeded, setSeeded] = useState(true);
  const [draft, setDraft] = useState<Partial<Category> | null>(null);
  const [status, setStatus] = useState({ error: '', note: '', busy: false });

  const load = () =>
    adminFetch<{ categories: Category[]; seeded: boolean }>('/api/admin/categories')
      .then((d) => { setCategories(d.categories); setSeeded(d.seeded); })
      .catch((e) => setStatus((s) => ({ ...s, error: e.message })));

  useEffect(() => { load(); }, []);

  const tree = useMemo(() => buildTree(categories, { includeInactive: true }), [categories]);
  const departments = categories.filter((c) => c.parentId === null);

  const run = async (fn: () => Promise<unknown>, note: string) => {
    setStatus({ error: '', note: '', busy: true });
    try {
      await fn();
      setStatus({ error: '', note, busy: false });
      await load();
      return true;
    } catch (e) {
      setStatus({ error: (e as Error).message, note: '', busy: false });
      return false;
    }
  };

  const seed = () => run(() => adminFetch('/api/admin/categories', { method: 'POST', body: JSON.stringify({ action: 'seed' }) }),
    'Default Women / Kids / Men tree saved. Edit freely from here.');

  const save = async () => {
    if (!draft) return;
    const ok = await run(() => adminFetch('/api/admin/categories', { method: 'POST', body: JSON.stringify(draft) }), 'Category saved.');
    if (ok) setDraft(null);
  };

  const toggle = (c: Category) =>
    run(() => adminFetch('/api/admin/categories', { method: 'POST', body: JSON.stringify({ ...c, active: !c.active }) }),
      c.active ? `${c.name} hidden from the store.` : `${c.name} is live.`);

  const remove = (c: Category) => {
    if (!confirm(`Delete “${c.name}”? Consider switching it off instead.`)) return;
    run(() => adminFetch(`/api/admin/categories?id=${c.id}`, { method: 'DELETE' }), 'Category deleted.');
  };

  const upload = async (file: File) => {
    setStatus((s) => ({ ...s, busy: true, error: '' }));
    try {
      const url = await uploadProductImage(file);
      setDraft((d) => d && { ...d, image: url });
      setStatus((s) => ({ ...s, busy: false }));
    } catch (e) {
      setStatus({ error: (e as Error).message, note: '', busy: false });
    }
  };

  const Row = ({ node, depth }: { node: CategoryNode; depth: number }) => (
    <>
      <li className={cn('flex flex-wrap items-center gap-3 py-3', depth > 0 && 'pl-6')}>
        <span className={cn('h-2 w-2 shrink-0 rounded-full', node.active ? 'bg-[#25D366]' : 'bg-line')} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className={cn(depth === 0 ? 'font-display text-lg' : 'text-sm font-medium', !node.active && 'text-carbon-muted')}>
            {node.name} {!node.active && <span className="ml-1 text-[10px] uppercase tracking-wide">hidden</span>}
          </p>
          <p className="text-xs text-carbon-muted">/collections/{node.slug} · order {node.order}{node.sizeSet ? ` · sizes: ${node.sizeSet}` : ''}</p>
        </div>
        <div className="flex gap-3 text-xs">
          {depth === 0 && seeded && <button onClick={() => setDraft(blank(node.id))} className="underline">Add sub-category</button>}
          {seeded && <button onClick={() => setDraft(node)} className="underline">Edit</button>}
          {seeded && <button onClick={() => toggle(node)} className="underline">{node.active ? 'Hide' : 'Show'}</button>}
          {seeded && <button onClick={() => remove(node)} className="text-terracotta underline">Delete</button>}
        </div>
      </li>
      {node.children.map((c) => <Row key={c.id} node={c} depth={depth + 1} />)}
    </>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-display-md">Categories</h1>
          <p className="mt-1 text-sm text-carbon-muted">Departments and their sub-categories drive the menu, footer, filters and product editor.</p>
        </div>
        {seeded && <button onClick={() => setDraft(blank())} className="btn-pill">Add department</button>}
      </div>

      {!seeded && (
        <div className="mt-6 rounded-card border border-champagne bg-ivory-soft p-5 text-sm">
          <p className="font-medium">You’re seeing the built-in default tree.</p>
          <p className="mt-1 text-carbon-muted">Save it to Firestore to start editing — it includes Women, Kids and a hidden Men department ready for later.</p>
          <button onClick={seed} disabled={status.busy} className="btn-pill mt-4 disabled:opacity-50">Save default categories</button>
        </div>
      )}

      {status.error && <p className="mt-4 text-sm text-terracotta">{status.error}</p>}
      {status.note && <p className="mt-4 text-sm text-carbon-muted">{status.note}</p>}

      {draft && (
        <div className="mt-6 rounded-card border border-line bg-ivory-soft p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">
              {draft.id ? `Edit ${draft.name}` : draft.parentId ? 'New sub-category' : 'New department'}
            </h2>
            <button onClick={() => setDraft(null)} className="text-xs text-carbon-muted underline">Cancel</button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="mb-1 block text-xs font-medium text-carbon-muted">Name</span>
              <input value={draft.name ?? ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={field} /></label>
            <label className="block"><span className="mb-1 block text-xs font-medium text-carbon-muted">URL slug (optional)</span>
              <input value={draft.slug ?? ''} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="auto from name" className={field} /></label>
            <label className="block"><span className="mb-1 block text-xs font-medium text-carbon-muted">Parent</span>
              <select value={draft.parentId ?? ''} onChange={(e) => setDraft({ ...draft, parentId: e.target.value || null })} className={field}>
                <option value="">— None (this is a department) —</option>
                {departments.filter((d) => d.id !== draft.id).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select></label>
            <label className="block"><span className="mb-1 block text-xs font-medium text-carbon-muted">Display order</span>
              <input type="number" value={draft.order ?? 99} onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })} className={field} /></label>
            {!draft.parentId && (
              <label className="block"><span className="mb-1 block text-xs font-medium text-carbon-muted">Size chart</span>
                <select value={draft.sizeSet ?? 'women'} onChange={(e) => setDraft({ ...draft, sizeSet: e.target.value as SizeSetId })} className={field}>
                  <option value="women">Women (XS–XXL)</option>
                  <option value="kids">Kids (age bands)</option>
                  <option value="men">Men (36–46)</option>
                </select></label>
            )}
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" checked={draft.active !== false} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="accent-carbon" />
              Visible on the storefront
            </label>
            <label className="block sm:col-span-2"><span className="mb-1 block text-xs font-medium text-carbon-muted">Description</span>
              <textarea rows={2} value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="w-full rounded-xl border border-line bg-ivory p-3 text-sm outline-none focus:border-carbon" /></label>
            <div className="sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-carbon-muted">Cover image</span>
              <div className="flex items-center gap-3">
                {draft.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.image} alt="" className="h-16 w-12 rounded object-cover" />
                )}
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
                  className="text-xs text-carbon-muted file:mr-2 file:rounded-pill file:border-0 file:bg-carbon file:px-3 file:py-1.5 file:text-xs file:text-ivory" />
              </div>
            </div>
          </div>
          <button onClick={save} disabled={status.busy} className="btn-pill mt-6 disabled:opacity-50">
            {status.busy ? 'Saving…' : 'Save category'}
          </button>
        </div>
      )}

      <ul className="mt-8 divide-y divide-line rounded-card border border-line bg-ivory-soft px-5">
        {tree.map((d) => <Row key={d.id} node={d} depth={0} />)}
      </ul>
    </div>
  );
}
