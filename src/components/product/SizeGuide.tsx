import { SIZE_GUIDES } from '@/lib/catalog';
import type { SizeSetId } from '@/types';

const HOW_TO = [
  'Measure over the undergarments you plan to wear with the outfit.',
  'Keep the tape snug but not tight — you should be able to slip a finger under it.',
  'For full length, measure from the waist to the floor wearing the heels you’ll pair it with.',
];

export default function SizeGuide({ set, compact }: { set: SizeSetId; compact?: boolean }) {
  const guide = SIZE_GUIDES[set];
  return (
    <div>
      {!compact && <h2 className="font-display text-2xl">{guide.title}</h2>}
      <div className="mt-3 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[420px] text-sm">
          <caption className="sr-only">{guide.title}, in inches</caption>
          <thead className="bg-ivory-dim text-left text-xs uppercase tracking-wide text-carbon-muted">
            <tr>{guide.columns.map((c) => <th key={c} scope="col" className="px-3 py-2.5 font-medium">{c}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {guide.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) => (
                  i === 0
                    ? <th key={i} scope="row" className="px-3 py-2.5 text-left font-medium">{cell}</th>
                    : <td key={i} className="px-3 py-2.5 text-carbon-muted">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-carbon-muted">All measurements in inches. {guide.note}</p>
      <ul className="mt-4 space-y-1.5 text-xs text-carbon-muted">
        {HOW_TO.map((t) => <li key={t} className="flex gap-2"><span className="text-champagne">◆</span>{t}</li>)}
      </ul>
    </div>
  );
}
