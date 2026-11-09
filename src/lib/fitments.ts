import type { FitmentInput } from '@/api/listings';

/** A fitment rule as the picker holds it: the API input plus a display label. */
export type FitmentRow = FitmentInput & { label: string };

/** The rule to send to the API: the row without its display label and without unset narrowing. */
export function toFitmentInput(row: FitmentRow): FitmentInput {
  const { makeSlug, modelSlug, year, generationSlug, trim, engineCode } = row;
  return {
    makeSlug,
    modelSlug,
    year,
    ...(generationSlug ? { generationSlug } : {}),
    ...(trim ? { trim } : {}),
    ...(engineCode ? { engineCode } : {}),
  };
}

/** Identity of a rule, for de-duplication and React keys. */
export function fitmentRowKey(r: FitmentInput): string {
  return [r.makeSlug, r.modelSlug, r.generationSlug ?? '', r.year, r.trim ?? '', r.engineCode ?? ''].join('|');
}
