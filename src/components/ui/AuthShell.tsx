'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { configured } = useAuth();
  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-display text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-sm text-carbon-muted">{subtitle}</p>}

        {!configured && (
          <p className="mt-6 rounded-card border border-line bg-ivory-soft p-4 text-center text-xs text-carbon-muted">
            Accounts activate once you add your Firebase keys to <code>.env.local</code>. You can still browse and
            check out as a guest.
          </p>
        )}

        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-carbon-muted">{footer}</div>}
      </div>
    </section>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-carbon-muted">{label}</span>
      <input
        {...props}
        className="h-11 w-full rounded-xl border border-line bg-ivory px-3.5 text-sm outline-none transition-colors focus:border-carbon"
      />
    </label>
  );
}

export function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-pill-ghost w-full justify-center disabled:opacity-50"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
        <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
      </svg>
      Continue with Google
    </button>
  );
}
