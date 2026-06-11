'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  configured: boolean;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, configured: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, configured: isFirebaseConfigured }}>{children}</Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
