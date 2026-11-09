import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GarageVehicle = {
  /** Garage key, see {@link garageVehicleKey}. Not a catalog id. */
  variantId: string;
  makeSlug: string;
  modelSlug: string;
  year: number;
  label: string;
  // Present when the generation is known (picked, or the model's only one).
  // Absent for legacy garage entries written before this change.
  generationSlug?: string;
  generationCode?: string | null;
  /** Catalog `vehicle_variants.id` once the buyer narrowed to an exact trim + engine. */
  vehicleVariantId?: string;
  trim?: string | null;
  engineCode?: string | null;
};

export interface GarageVehicleIdentity {
  makeSlug: string;
  modelSlug: string;
  generationSlug?: string | null;
  year: number;
  vehicleVariantId?: string | null;
}

/**
 * Stable key for a garage entry: `make-model[-generation]-year[-variantId]`.
 * A model year and one of its exact versions are two different entries.
 */
export function garageVehicleKey(v: GarageVehicleIdentity): string {
  return [v.makeSlug, v.modelSlug, v.generationSlug, v.year, v.vehicleVariantId]
    .filter((part) => part !== null && part !== undefined && part !== '')
    .join('-');
}

/** "Ford Fusion CD391 2017 SE 2.0 EcoBoost" from whichever parts are known. */
export function garageVehicleLabel(parts: {
  makeName: string;
  modelName: string;
  generationCode?: string | null;
  year: number;
  trim?: string | null;
  engineCode?: string | null;
}): string {
  return [parts.makeName, parts.modelName, parts.generationCode, parts.year, parts.trim, parts.engineCode]
    .filter((part) => part !== null && part !== undefined && part !== '')
    .join(' ');
}

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
