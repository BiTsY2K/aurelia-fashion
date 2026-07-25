'use client';

import { MEASUREMENT_FIELDS } from '@/lib/catalog';
import type { Measurements, SizeSetId } from '@/types';

/** Custom measurement inputs (inches) for made-to-measure orders. */
export default function MeasurementFields({
  set,
  value,
  onChange,
}: {
  set: SizeSetId;
  value: Measurements;
  onChange: (next: Measurements) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {MEASUREMENT_FIELDS[set].map((f) => (
        <label key={f.id} className="block">
          <span className="block text-xs font-medium text-carbon">{f.label}</span>
          <span className="block text-[11px] text-carbon-muted">{f.hint}</span>
          <span className="relative mt-1 block">
            <input
              inputMode="decimal"
              value={value[f.id] ?? ''}
              onChange={(e) => onChange({ ...value, [f.id]: e.target.value.replace(/[^0-9.'"\- ]/g, '').slice(0, 8) })}
              placeholder="—"
              className="h-10 w-full rounded-xl border border-line bg-ivory pl-3 pr-9 text-sm outline-none focus:border-carbon"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-carbon-muted">
              {f.id === 'age' ? 'yrs' : 'in'}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}
