'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell, Field, GoogleButton } from '@/components/ui/AuthShell';
import { signInWithEmail, signInWithGoogle, authErrorMessage } from '@/lib/auth';
import { useAuth } from '@/context/auth-provider';

export default function SignInPage() {
  const router = useRouter();
  const { configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handle = async (fn: () => Promise<unknown>) => {
    setError('');
    setBusy(true);
    try {
      await fn();
      router.push('/account');
    } catch (e) {
      const err = e as { code?: string; message?: string };
      if (process.env.NODE_ENV === 'development') console.error('[sign-in]', err.code, err.message, e);
      setError(authErrorMessage(err.code ?? ''));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to track orders and save your favourites."
      footer={
        <>
          New here?{' '}
          <Link href="/sign-up" className="text-carbon underline">Create an account</Link>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handle(() => signInWithEmail(email, password));
        }}
        className="space-y-3"
      >
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!configured} />
        <Field label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={!configured} />
        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-carbon-muted underline">Forgot password?</Link>
        </div>
        {error && <p className="text-xs text-terracotta">{error}</p>}
        <button type="submit" disabled={busy || !configured} className="btn-pill w-full justify-center disabled:opacity-50">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-carbon-muted">
        <span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" />
      </div>
      <GoogleButton onClick={() => handle(signInWithGoogle)} disabled={busy || !configured} />
    </AuthShell>
  );
}
