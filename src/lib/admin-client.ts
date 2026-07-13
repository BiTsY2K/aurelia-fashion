'use client';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseAuth, getFirebaseStorage } from '@/lib/firebase';

/** Calls an admin API route with the current user's Firebase ID token attached. */
export async function adminFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Sign in to continue.');
  const token = await user.getIdToken();

  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Request failed.');
  return data as T;
}

/** Uploads an image to Firebase Storage and returns its public URL. */
export async function uploadProductImage(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error('Images must be under 5 MB.');
  if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed.');

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storageRef = ref(getFirebaseStorage(), `products/${Date.now()}_${safeName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
