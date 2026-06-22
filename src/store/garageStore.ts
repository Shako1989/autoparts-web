import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GarageVehicle = {
  variantId: string;
  makeSlug: string;
  modelSlug: string;
  year: number;
  label: string;
  // Present when the model had multiple generations and the user picked one.
  // Absent for legacy garage entries written before this change.
  generationSlug?: string;
  generationCode?: string | null;
};

type GarageState = {
  vehicles: GarageVehicle[];
  activeVariantId: string | null;
  add: (v: GarageVehicle) => void;
  remove: (variantId: string) => void;
  setActive: (v: GarageVehicle | null) => void;
  clearActive: () => void;
  clear: () => void;
};

export const useGarageStore = create<GarageState>()(
  persist(
    (set) => ({
      vehicles: [],
      activeVariantId: null,
      add: (v) =>
        set((s) =>
          s.vehicles.some((existing) => existing.variantId === v.variantId)
            ? { ...s, activeVariantId: v.variantId }
            : { vehicles: [...s.vehicles, v], activeVariantId: v.variantId },
        ),
      remove: (variantId) =>
        set((s) => ({
          vehicles: s.vehicles.filter((v) => v.variantId !== variantId),
          activeVariantId: s.activeVariantId === variantId ? null : s.activeVariantId,
        })),
      setActive: (v) =>
        set((s) => {
          if (!v) return { ...s, activeVariantId: null };
          const known = s.vehicles.some((existing) => existing.variantId === v.variantId);
          return {
            vehicles: known ? s.vehicles : [...s.vehicles, v],
            activeVariantId: v.variantId,
          };
        }),
      clearActive: () => set({ activeVariantId: null }),
      clear: () => set({ vehicles: [], activeVariantId: null }),
    }),
    { name: 'autoparts-garage' },
  ),
);

export function useActiveVehicle(): GarageVehicle | null {
  const id = useGarageStore((s) => s.activeVariantId);
  const vehicles = useGarageStore((s) => s.vehicles);
  if (!id) return null;
  return vehicles.find((v) => v.variantId === id) ?? null;
}
