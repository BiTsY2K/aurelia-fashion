import 'server-only';
import { getAuth } from 'firebase-admin/auth';
import { getApps } from 'firebase-admin/app';
import { adminDb, isAdminConfigured } from '@/lib/firebase-admin';

export interface AdminCheck {
  ok: boolean;
  uid?: string;
  status: number;
  error?: string;
}

/**
 * Verifies the Bearer ID token on the request and confirms the caller's
 * Firestore /users doc carries role === 'admin'. Never trusts the client.
 */
export async function requireAdmin(req: Request): Promise<AdminCheck> {
  if (!isAdminConfigured()) {
    return { ok: false, status: 503, error: 'Server credentials are not configured.' };
  }

  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return { ok: false, status: 401, error: 'Sign in to continue.' };

  try {
    // adminDb() initializes the admin app as a side effect.
    const db = adminDb();
    if (!db || !getApps().length) {
      return { ok: false, status: 503, error: 'Server credentials are not configured.' };
    }

    const decoded = await getAuth().verifyIdToken(token);
    const snap = await db.collection('users').doc(decoded.uid).get();

    if (snap.data()?.role !== 'admin') {
      return { ok: false, status: 403, error: 'This account doesn’t have admin access.' };
    }
    return { ok: true, uid: decoded.uid, status: 200 };
  } catch {
    return { ok: false, status: 401, error: 'Your session expired. Sign in again.' };
  }
}
