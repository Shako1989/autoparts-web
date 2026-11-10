import { useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiClient } from './client';

// ---------- response types (mirror the backend DTOs) ----------

export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'EV' | 'LPG';
export type PartNumberType = 'OEM' | 'AFTERMARKET';

export interface VehicleMake {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  popularity: number;
}

export interface VehicleModel {
  id: string;
  makeId: string;
  name: string;
  slug: string;
  yearFrom: number;
  yearTo: number | null;
}

export interface VehicleGeneration {
  id: string;
  modelId: string;
  code: string | null;
  name: string;
  slug: string;
  yearFrom: number;
  yearTo: number | null;
}

export interface VehicleVariant {
  id: string;
  generationId?: string;
  modelId: string;
  year: number;
  trim: string | null;
  engineCode: string | null;
  bodyType: string | null;
  fuel: FuelType | null;
}

export interface CategoryNode {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  iconUrl: string | null;
  sortOrder: number;
  children: CategoryNode[];
}

export interface CategoryDetail {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  iconUrl: string | null;
  sortOrder: number;
  children: CategoryNode[];
  breadcrumbs: { id: string; slug: string; name: string }[];
}

export interface PartNumberEntry {
  number: string;
  type: PartNumberType;
  source: string | null;
}

export interface PartListItem {
  id: string;
  categorySlug: string;
  name: string;
  brand: string | null;
  defaultImageUrl: string | null;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface PartDetail {
  id: string;
  categoryId: string;
  categorySlug: string;
  name: string;
  brand: string | null;
  description: string | null;
  defaultImageUrl: string | null;
  partNumbers: PartNumberEntry[];
}

export interface FitmentEntry {
  id: string;
  partId: string;
  vehicleVariantId: string;
  makeName: string;
  modelName: string;
  year: number;
  trim: string | null;
  engineCode: string | null;
  position: string | null;
  notes: string | null;
}

export interface DiagramCalloutPart {
  id: string;
  categorySlug: string;
  name: string;
  brand: string | null;
  defaultImageUrl: string | null;
  partNumbers: PartNumberEntry[];
}

export interface DiagramCallout {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number | null;
  h: number | null;
  zOrder: number;
  notes: string | null;
  part: DiagramCalloutPart;
}

export interface Diagram {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  categoryId: string | null;
  vehicleVariantId: string | null;
  callouts: DiagramCallout[];
}

// VIN lookup (GET /v1/catalog/vin/{vin}); see ARCHITECTURE.md §6b.

export type VinMatchStatus =
  | 'EXACT'
  | 'AMBIGUOUS'
  | 'MODEL_ONLY'
  | 'MAKE_ONLY'
  | 'NOT_IN_CATALOG'
  | 'NOT_DECODED';

export interface VinDecodedEngine {
  displacementL: number | null;
  cylinders: number | null;
  horsepower: number | null;
  engineModel: string | null;
  fuelPrimary: string | null;
  fuelSecondary: string | null;
  electrificationLevel: string | null;
}

/** What NHTSA vPIC knows about the car. Every field may be null. */
export interface VinDecodedVehicle {
  make: string | null;
  model: string | null;
  year: number | null;
  series: string | null;
  trim: string | null;
  bodyClass: string | null;
  vehicleType: string | null;
  driveType: string | null;
  engine: VinDecodedEngine;
  plantCountry: string | null;
  errorCode: string | null;
  errorText: string | null;
}

/** What could be mapped onto our own catalog rows. */
export interface VinCatalogMatch {
  make: VehicleMake | null;
  model: VehicleModel | null;
  generation: VehicleGeneration | null;
  variants: VehicleVariant[];
  fuel: FuelType | null;
  bodyType: string | null;
}

export interface VinLookupResponse {
  vin: string;
  status: VinMatchStatus;
  decoded: VinDecodedVehicle;
  match: VinCatalogMatch;
}

// ---------- query keys ----------

const KEY = {
  makes: ['catalog', 'makes'] as const,
  models: (makeSlug: string) => ['catalog', 'models', makeSlug] as const,
  years: (modelId: string) => ['catalog', 'years', modelId] as const,
  generations: (modelId: string) => ['catalog', 'generations', modelId] as const,
  yearsByGeneration: (generationId: string) => ['catalog', 'yearsByGeneration', generationId] as const,
  variants: (modelId: string, year: number) => ['catalog', 'variants', modelId, year] as const,
  variantsByGeneration: (generationId: string, year: number) =>
    ['catalog', 'variantsByGeneration', generationId, year] as const,
  tree: (lang: string) => ['catalog', 'tree', lang] as const,
  category: (slug: string, lang: string) => ['catalog', 'category', slug, lang] as const,
  partsInCategory: (
    slug: string, page: number, size: number, lang: string,
    makeSlug?: string | null, modelSlug?: string | null, year?: number | null,
    variantId?: string | null,
  ) =>
    ['catalog', 'category', slug, 'parts', page, size, lang,
     makeSlug ?? null, modelSlug ?? null, year ?? null, variantId ?? null] as const,
  partCounts: (
    makeSlug?: string | null, modelSlug?: string | null, year?: number | null, variantId?: string | null,
  ) =>
    ['catalog', 'partCounts', makeSlug ?? null, modelSlug ?? null, year ?? null, variantId ?? null] as const,
  partsForVehicle: (
    page: number, size: number, lang: string,
    makeSlug?: string | null, modelSlug?: string | null, year?: number | null, variantId?: string | null,
  ) =>
    ['catalog', 'parts', page, size, lang,
     makeSlug ?? null, modelSlug ?? null, year ?? null, variantId ?? null] as const,
  part: (id: string, lang: string) => ['catalog', 'part', id, lang] as const,
  fitments: (partId: string) => ['catalog', 'fitments', partId] as const,
  diagram: (slug: string, lang: string) => ['catalog', 'diagram', slug, lang] as const,
  categoryDiagrams: (
    slug: string, lang: string,
    makeSlug?: string | null, modelSlug?: string | null, year?: number | null,
    variantId?: string | null,
  ) =>
    ['catalog', 'category', slug, 'diagrams', lang,
     makeSlug ?? null, modelSlug ?? null, year ?? null, variantId ?? null] as const,
};

// ---------- raw fetchers ----------

async function get<T>(path: string): Promise<T> {
  const r = await apiClient.get<T>(path);
  return r.data;
}

// ---------- hooks ----------

const longStale = { staleTime: 5 * 60_000 } as const;

export function useMakes(): ReturnType<typeof useQuery<VehicleMake[]>> {
  return useQuery({ queryKey: KEY.makes, queryFn: () => get<VehicleMake[]>('/v1/catalog/makes'), ...longStale });
}

export function useModels(makeSlug: string | undefined): ReturnType<typeof useQuery<VehicleModel[]>> {
  return useQuery({
    queryKey: KEY.models(makeSlug ?? ''),
    queryFn: () => get<VehicleModel[]>(`/v1/catalog/makes/${makeSlug}/models`),
    enabled: !!makeSlug,
    ...longStale,
  });
}

export function useYears(modelId: string | undefined): ReturnType<typeof useQuery<number[]>> {
  return useQuery({
    queryKey: KEY.years(modelId ?? ''),
    queryFn: () => get<number[]>(`/v1/catalog/models/${modelId}/years`),
    enabled: !!modelId,
    ...longStale,
  });
}

export function useGenerations(modelId: string | undefined): ReturnType<typeof useQuery<VehicleGeneration[]>> {
  return useQuery({
    queryKey: KEY.generations(modelId ?? ''),
    queryFn: () => get<VehicleGeneration[]>(`/v1/catalog/models/${modelId}/generations`),
    enabled: !!modelId,
    ...longStale,
  });
}

export function useYearsByGeneration(generationId: string | undefined): ReturnType<typeof useQuery<number[]>> {
  return useQuery({
    queryKey: KEY.yearsByGeneration(generationId ?? ''),
    queryFn: () => get<number[]>(`/v1/catalog/generations/${generationId}/years`),
    enabled: !!generationId,
    ...longStale,
  });
}

export function useVariants(
  modelId: string | undefined,
  year: number | undefined,
): ReturnType<typeof useQuery<VehicleVariant[]>> {
  return useQuery({
    queryKey: KEY.variants(modelId ?? '', year ?? -1),
    queryFn: () => get<VehicleVariant[]>(`/v1/catalog/variants?model=${modelId}&year=${year}`),
    enabled: !!modelId && year !== undefined,
    ...longStale,
  });
}

/** Variants (trim + engine) of one generation in one model year; what the picker's Trim/Engine selects are built from. */
export function useVariantsByGeneration(
  generationId: string | undefined,
  year: number | undefined,
): ReturnType<typeof useQuery<VehicleVariant[]>> {
  return useQuery({
    queryKey: KEY.variantsByGeneration(generationId ?? '', year ?? -1),
    queryFn: () => get<VehicleVariant[]>(`/v1/catalog/variants?generation=${generationId}&year=${year}`),
    enabled: !!generationId && year !== undefined,
    ...longStale,
  });
}

/** Vehicle filter for category parts/diagrams. `variantId` (exact version) wins over make/model/year on the server. */
export interface VehicleFilter {
  makeSlug?: string | null;
  modelSlug?: string | null;
  year?: number | null;
  variantId?: string | null;
}

function vehicleFilterParams(filter: VehicleFilter | undefined, params: URLSearchParams): void {
  if (filter?.makeSlug) params.set('make', filter.makeSlug);
  if (filter?.modelSlug) params.set('model', filter.modelSlug);
  if (filter?.year !== null && filter?.year !== undefined) params.set('year', String(filter.year));
  if (filter?.variantId) params.set('variant', filter.variantId);
}

export function useCategoryTree(): ReturnType<typeof useQuery<CategoryNode[]>> {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'az';
  return useQuery({
    queryKey: KEY.tree(lang),
    queryFn: () => get<CategoryNode[]>('/v1/catalog/categories'),
    ...longStale,
  });
}

export function useCategory(slug: string | undefined): ReturnType<typeof useQuery<CategoryDetail>> {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'az';
  return useQuery({
    queryKey: KEY.category(slug ?? '', lang),
    queryFn: () => get<CategoryDetail>(`/v1/catalog/categories/${slug}`),
    enabled: !!slug,
    ...longStale,
  });
}

export function usePartsInCategory(
  slug: string | undefined,
  page = 0,
  size = 20,
  filter?: VehicleFilter,
): ReturnType<typeof useQuery<PageResponse<PartListItem>>> {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'az';
  const mk = filter?.makeSlug ?? null;
  const m = filter?.modelSlug ?? null;
  const y = filter?.year ?? null;
  const v = filter?.variantId ?? null;
  return useQuery({
    queryKey: KEY.partsInCategory(slug ?? '', page, size, lang, mk, m, y, v),
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', String(size));
      vehicleFilterParams(filter, params);
      return get<PageResponse<PartListItem>>(`/v1/catalog/categories/${slug}/parts?${params}`);
    },
    enabled: !!slug,
    ...longStale,
  });
}

/**
 * Active parts per category id for a vehicle, rolled up to the roots
 * (`{ [categoryId]: count }`); categories without parts are absent.
 */
export function useCategoryPartCounts(
  filter: VehicleFilter | undefined,
  enabled = true,
): ReturnType<typeof useQuery<Record<string, number>>> {
  const mk = filter?.makeSlug ?? null;
  const m = filter?.modelSlug ?? null;
  const y = filter?.year ?? null;
  const v = filter?.variantId ?? null;
  return useQuery({
    queryKey: KEY.partCounts(mk, m, y, v),
    queryFn: () => {
      const params = new URLSearchParams();
      vehicleFilterParams(filter, params);
      return get<Record<string, number>>(`/v1/catalog/categories/part-counts?${params}`);
    },
    enabled,
    ...longStale,
  });
}

/** Parts that fit the vehicle in any category, newest first. */
export function usePartsForVehicle(
  filter: VehicleFilter | undefined,
  size = 12,
  enabled = true,
  page = 0,
): ReturnType<typeof useQuery<PageResponse<PartListItem>>> {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'az';
  const mk = filter?.makeSlug ?? null;
  const m = filter?.modelSlug ?? null;
  const y = filter?.year ?? null;
  const v = filter?.variantId ?? null;
  return useQuery({
    queryKey: KEY.partsForVehicle(page, size, lang, mk, m, y, v),
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', String(size));
      vehicleFilterParams(filter, params);
      return get<PageResponse<PartListItem>>(`/v1/catalog/parts?${params}`);
    },
    enabled,
    ...longStale,
  });
}

export function usePart(
  partId: string | undefined,
  options?: Partial<UseQueryOptions<PartDetail>>,
): ReturnType<typeof useQuery<PartDetail>> {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'az';
  return useQuery({
    queryKey: KEY.part(partId ?? '', lang),
    queryFn: () => get<PartDetail>(`/v1/catalog/parts/${partId}`),
    enabled: !!partId,
    ...longStale,
    ...options,
  });
}

export function usePartFitments(partId: string | undefined): ReturnType<typeof useQuery<FitmentEntry[]>> {
  return useQuery({
    queryKey: KEY.fitments(partId ?? ''),
    queryFn: () => get<FitmentEntry[]>(`/v1/catalog/parts/${partId}/fitments`),
    enabled: !!partId,
    ...longStale,
  });
}

export function useDiagram(slug: string | undefined): ReturnType<typeof useQuery<Diagram>> {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'az';
  return useQuery({
    queryKey: KEY.diagram(slug ?? '', lang),
    queryFn: () => get<Diagram>(`/v1/catalog/diagrams/${slug}`),
    enabled: !!slug,
    ...longStale,
  });
}

export function useCategoryDiagrams(
  slug: string | undefined,
  filter?: VehicleFilter,
): ReturnType<typeof useQuery<Diagram[]>> {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'az';
  const mk = filter?.makeSlug ?? null;
  const m = filter?.modelSlug ?? null;
  const y = filter?.year ?? null;
  const v = filter?.variantId ?? null;
  return useQuery({
    queryKey: KEY.categoryDiagrams(slug ?? '', lang, mk, m, y, v),
    queryFn: () => {
      const params = new URLSearchParams();
      vehicleFilterParams(filter, params);
      const path = params.toString()
        ? `/v1/catalog/categories/${slug}/diagrams?${params}`
        : `/v1/catalog/categories/${slug}/diagrams`;
      return get<Diagram[]>(path);
    },
    enabled: !!slug,
    ...longStale,
  });
}

export async function lookupVin(vin: string, year?: number): Promise<VinLookupResponse> {
  const base = `/v1/catalog/vin/${encodeURIComponent(vin)}`;
  return get<VinLookupResponse>(year ? `${base}?year=${year}` : base);
}

/** Imperative VIN lookup for a submit button; the server caches decodes, so no client cache is kept. */
export function useVinLookup() {
  return useMutation({ mutationFn: (vin: string) => lookupVin(vin) });
}
