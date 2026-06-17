import 'server-only';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let _app: App | null = null;

/** Returns the admin app, or null if no service account is configured. */
function adminApp(): App | null {
  if (_app) return _app;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const serviceAccount = JSON.parse(raw);
    _app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
    return _app;
  } catch {
    return null;
  }
}

export function adminDb(): Firestore | null {
  const app = adminApp();
  return app ? getFirestore(app) : null;
}

export const isAdminConfigured = () => Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);
