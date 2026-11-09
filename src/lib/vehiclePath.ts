/** What a picker hands back once the buyer confirmed a car. */
export interface PickedVehicle {
  makeSlug: string;
  modelSlug: string;
  year: number;
  /** Catalog variant id when the buyer narrowed down to one exact trim + engine. */
  vehicleVariantId?: string;
}

/** `/v/ford/fusion/2017`, plus `?variant=` when the exact version is known. */
export function vehiclePagePath(v: PickedVehicle): string {
  const base = `/v/${v.makeSlug}/${v.modelSlug}/${v.year}`;
  return v.vehicleVariantId ? `${base}?variant=${encodeURIComponent(v.vehicleVariantId)}` : base;
}
