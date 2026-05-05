import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  listingId: string;
  title: string;
  priceMinor: number;
  qty: number;
  thumbnailUrl?: string;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQty: (listingId: string, qty: number) => void;
  remove: (listingId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.listingId === item.listingId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.listingId === item.listingId ? { ...i, qty: i.qty + item.qty } : i,
              ),
            };
          }
          return { items: [...s.items, item] };
        }),
      setQty: (listingId, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.listingId === listingId ? { ...i, qty } : i)),
        })),
      remove: (listingId) =>
        set((s) => ({ items: s.items.filter((i) => i.listingId !== listingId) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'autoparts-cart' },
  ),
);
