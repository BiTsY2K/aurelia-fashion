'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthShell, Field } from '@/components/ui/AuthShell';
import { resetPassword, authErrorMessage } from '@/lib/auth';
import { useAuth } from '@/context/auth-provider';

export default function ForgotPasswordPage() {
  const { configured } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(authErrorMessage((err as { code?: string }).code ?? ''));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="We’ll email you a secure link to set a new one."
      footer={<Link href="/sign-in" className="text-carbon underline">Back to sign in</Link>}
    >
      {sent ? (
        <p className="rounded-card border border-line bg-ivory-soft p-4 text-center text-sm">
          Check your inbox — a reset link is on its way to <strong>{email}</strong>.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!configured} />
          {error && <p className="text-xs text-terracotta">{error}</p>}
          <button type="submit" disabled={busy || !configured} className="btn-pill w-full justify-center disabled:opacity-50">
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
