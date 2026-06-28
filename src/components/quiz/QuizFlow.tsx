'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { visibleSteps, buildProfile, type QuizAnswers } from '@/lib/quiz';
import { useStyleProfile, syncProfileToAccount } from '@/context/profile-store';
import { useAuth } from '@/context/auth-provider';
import CuratingLoader from '@/components/quiz/CuratingLoader';
import { cn } from '@/lib/utils';

export default function QuizFlow() {
  const router = useRouter();
  const { user } = useAuth();
  const setProfile = useStyleProfile((s) => s.setProfile);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [curating, setCurating] = useState(false);

  // Steps depend on earlier answers (women vs kids), so recompute as answers change.
  const steps = visibleSteps(answers);
  const step = steps[Math.min(index, steps.length - 1)];
  const current = answers[step.id];
  const selected = current === undefined ? [] : Array.isArray(current) ? current : [current];
  const canAdvance = selected.length > 0;
  const isLast = index === steps.length - 1;

  const choose = (value: string) => {
    setAnswers((prev) => {
      if (!step.multi) return { ...prev, [step.id]: value };
      const existing = (prev[step.id] as string[]) ?? [];
      return {
        ...prev,
        [step.id]: existing.includes(value) ? existing.filter((v) => v !== value) : [...existing, value],
      };
    });
  };

  const next = () => {
    if (!canAdvance) return;
    if (!isLast) { setIndex((i) => i + 1); return; }

    const profile = buildProfile(answers);
    setProfile(profile);
    if (user) syncProfileToAccount(user.uid, profile);
    setCurating(true);
  };

  if (curating) return <CuratingLoader onDone={() => router.push('/style-quiz/results')} />;

  return (
    <section className="container-page py-14">
      <div className="mx-auto max-w-xl">
        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-pill bg-ivory-dim">
            <div
              className="h-full rounded-pill bg-champagne transition-all duration-500 ease-brand"
              style={{ width: `${((index + 1) / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-carbon-muted">{index + 1} / {steps.length}</span>
        </div>

        <div key={step.id} className="animate-fade-up">
          <h1 className="mt-9 text-display-md">{step.question}</h1>
          {step.help && <p className="mt-2 text-sm text-carbon-muted">{step.help}</p>}

          <div className={cn('mt-8 grid gap-3', step.id === 'size' ? 'grid-cols-3' : 'sm:grid-cols-2')}>
            {step.options.map((option) => {
              const active = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => choose(option.value)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-card border p-4 text-left transition-all duration-300 ease-brand',
                    step.id === 'size' && 'p-3 text-center',
                    active
                      ? 'border-carbon bg-carbon text-ivory'
                      : 'border-line bg-ivory-soft hover:border-carbon',
                  )}
                >
                  <span className="block text-sm font-medium">{option.label}</span>
                  {option.hint && (
                    <span className={cn('mt-1 block text-xs', active ? 'text-ivory/70' : 'text-carbon-muted')}>
                      {option.hint}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-9 flex items-center justify-between">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="text-sm text-carbon-muted underline disabled:opacity-0"
          >
            Back
          </button>
          <button onClick={next} disabled={!canAdvance} className="btn-pill disabled:opacity-40">
            {isLast ? 'See my picks' : 'Continue'}
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        {step.multi && <p className="mt-4 text-xs text-carbon-muted">Choose as many as apply.</p>}
      </div>
    </section>
  );
}
