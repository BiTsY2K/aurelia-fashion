'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: CartItem) => void;
  remove: (productId: string, size: string, color: string) => void;
  setQty: (productId: string, size: string, color: string, qty: number) => void;
  clear: () => void;
}

const sameLine = (a: CartItem, p: string, s: string, c: string) =>
  a.productId === p && a.size === s && a.color === c;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item.productId, item.size, item.color));
          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i === existing ? { ...i, quantity: i.quantity + item.quantity } : i,
              ),
            };
          }
          return { isOpen: true, items: [...state.items, item] };
        }),
      remove: (productId, size, color) =>
        set((state) => ({ items: state.items.filter((i) => !sameLine(i, productId, size, color)) })),
      setQty: (productId, size, color, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (sameLine(i, productId, size, color) ? { ...i, quantity: Math.max(0, qty) } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'aurelia-cart' }, // synced to localStorage; Firestore sync added in Phase 2
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((s, i) => s + i.price * i.quantity, 0);
