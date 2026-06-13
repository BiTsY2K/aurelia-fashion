'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell, Field, GoogleButton } from '@/components/ui/AuthShell';
import { signUpWithEmail, signInWithGoogle, authErrorMessage } from '@/lib/auth';
import { useAuth } from '@/context/auth-provider';

export default function SignUpPage() {
  const router = useRouter();
  const { configured } = useAuth();
  const [name, setName] = useState('');
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
      if (process.env.NODE_ENV === 'development') console.error('[sign-up]', err.code, err.message, e);
      setError(authErrorMessage(err.code ?? ''));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Aurelia for early access to new drops."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/sign-in" className="text-carbon underline">Sign in</Link>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handle(() => signUpWithEmail(name, email, password));
        }}
        className="space-y-3"
      >
        <Field label="Full name" type="text" required value={name} onChange={(e) => setName(e.target.value)} disabled={!configured} />
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!configured} />
        <Field label="Password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} disabled={!configured} />
        {error && <p className="text-xs text-terracotta">{error}</p>}
        <button type="submit" disabled={busy || !configured} className="btn-pill w-full justify-center disabled:opacity-50">
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-carbon-muted">
        <span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" />
      </div>
      <GoogleButton onClick={() => handle(signInWithGoogle)} disabled={busy || !configured} />
    </AuthShell>
  );
}
