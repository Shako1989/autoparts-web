import type { VehicleVariant } from '@/api/catalog';

/** Non-empty values in first-seen order. */
export function distinct(values: (string | null | undefined)[]): string[] {
  const out: string[] = [];
  for (const value of values) {
    if (value && !out.includes(value)) out.push(value);
  }
  return out;
}

export interface NarrowedVariants {
  trims: string[];
  engines: string[];
  /** The one variant left once trim and engine are applied, if exactly one is. */
  resolved: VehicleVariant | undefined;
}

/**
 * Trim and engine narrow each other: the trim list only shows trims sold with
 * the chosen engine and vice versa. When exactly one variant is left it is the
 * picked version, which is how a trim with a single engine fills the engine in
 * by itself (and a year with a single variant needs no choice at all).
 */
export function narrowVariants(all: VehicleVariant[], trim: string, engine: string): NarrowedVariants {
  const byTrim = (v: VehicleVariant): boolean => !trim || v.trim === trim;
  const byEngine = (v: VehicleVariant): boolean => !engine || v.engineCode === engine;
  const matching = all.filter((v) => byTrim(v) && byEngine(v));
  return {
    trims: distinct(all.filter(byEngine).map((v) => v.trim)),
    engines: distinct(all.filter(byTrim).map((v) => v.engineCode)).sort((a, b) => a.localeCompare(b)),
    resolved: matching.length === 1 ? matching[0] : undefined,
  };
}
