import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GarageVehicle = {
  variantId: string;
  makeSlug: string;
  modelSlug: string;
  year: number;
  label: string;
};

type GarageState = {
  vehicles: GarageVehicle[];
  add: (v: GarageVehicle) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

export const useGarageStore = create<GarageState>()(
  persist(
    (set) => ({
      vehicles: [],
      add: (v) =>
        set((s) =>
          s.vehicles.some((existing) => existing.variantId === v.variantId)
            ? s
            : { vehicles: [...s.vehicles, v] },
        ),
      remove: (variantId) =>
        set((s) => ({ vehicles: s.vehicles.filter((v) => v.variantId !== variantId) })),
      clear: () => set({ vehicles: [] }),
    }),
    { name: 'autoparts-garage' },
  ),
);
