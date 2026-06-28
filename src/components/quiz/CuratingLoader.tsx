'use client';

import { useEffect, useState } from 'react';

const LINES = [
  'Reading your answers',
  'Matching silhouettes',
  'Checking your size in stock',
  'Curating your personalized fashion profile',
];

/**
 * The transition between finishing the quiz and seeing the storefront.
 * Deliberately restrained: one slow arc, one line of text at a time.
 * Honours prefers-reduced-motion via the global CSS reset.
 */
export default function CuratingLoader({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      const t = setTimeout(onDone, 400);
      return () => clearTimeout(t);
    }

    const interval = setInterval(() => setStep((s) => s + 1), 900);
    const finish = setTimeout(onDone, LINES.length * 900 + 400);
    return () => {
      clearInterval(interval);
      clearTimeout(finish);
    };
  }, [onDone]);

  const progress = Math.min(100, ((step + 1) / LINES.length) * 100);

  return (
    <div className="grid min-h-[70vh] place-items-center px-6" role="status" aria-live="polite">
      <div className="w-full max-w-sm text-center">
        {/* Slow-turning arc, drawn rather than spun */}
        <svg viewBox="0 0 100 100" className="mx-auto h-20 w-20" aria-hidden>
          <circle cx="50" cy="50" r="42" fill="none" stroke="#E7E0D6" strokeWidth="2" />
          <circle
            cx="50" cy="50" r="42" fill="none" stroke="#C8A96A" strokeWidth="2"
            strokeLinecap="round" strokeDasharray="264"
            strokeDashoffset={264 - (264 * progress) / 100}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)' }}
          />
        </svg>

        <p key={step} className="mt-8 animate-fade-up font-display text-xl">
          {LINES[Math.min(step, LINES.length - 1)]}…
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-carbon-muted">One moment</p>
      </div>
    </div>
  );
}
