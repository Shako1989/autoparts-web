import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
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

export interface VehicleVariant {
  id: string;
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

// ---------- query keys ----------

const KEY = {
  makes: ['catalog', 'makes'] as const,
  models: (makeSlug: string) => ['catalog', 'models', makeSlug] as const,
  years: (modelId: string) => ['catalog', 'years', modelId] as const,
  variants: (modelId: string, year: number) => ['catalog', 'variants', modelId, year] as const,
  tree: (lang: string) => ['catalog', 'tree', lang] as const,
  category: (slug: string, lang: string) => ['catalog', 'category', slug, lang] as const,
  partsInCategory: (
    slug: string, page: number, size: number, lang: string,
    makeSlug?: string | null, modelSlug?: string | null, year?: number | null,
  ) =>
    ['catalog', 'category', slug, 'parts', page, size, lang,
     makeSlug ?? null, modelSlug ?? null, year ?? null] as const,
  part: (id: string, lang: string) => ['catalog', 'part', id, lang] as const,
  fitments: (partId: string) => ['catalog', 'fitments', partId] as const,
  diagram: (slug: string, lang: string) => ['catalog', 'diagram', slug, lang] as const,
  categoryDiagrams: (
    slug: string, lang: string,
    makeSlug?: string | null, modelSlug?: string | null, year?: number | null,
  ) =>
    ['catalog', 'category', slug, 'diagrams', lang,
     makeSlug ?? null, modelSlug ?? null, year ?? null] as const,
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
  filter?: { makeSlug?: string | null; modelSlug?: string | null; year?: number | null },
): ReturnType<typeof useQuery<PageResponse<PartListItem>>> {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'az';
  const mk = filter?.makeSlug ?? null;
  const m = filter?.modelSlug ?? null;
  const y = filter?.year ?? null;
  return useQuery({
    queryKey: KEY.partsInCategory(slug ?? '', page, size, lang, mk, m, y),
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', String(size));
      if (mk) params.set('make', mk);
      if (m) params.set('model', m);
      if (y !== null && y !== undefined) params.set('year', String(y));
      return get<PageResponse<PartListItem>>(`/v1/catalog/categories/${slug}/parts?${params}`);
    },
    enabled: !!slug,
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
  filter?: { makeSlug?: string | null; modelSlug?: string | null; year?: number | null },
): ReturnType<typeof useQuery<Diagram[]>> {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'az';
  const mk = filter?.makeSlug ?? null;
  const m = filter?.modelSlug ?? null;
  const y = filter?.year ?? null;
  return useQuery({
    queryKey: KEY.categoryDiagrams(slug ?? '', lang, mk, m, y),
    queryFn: () => {
      const params = new URLSearchParams();
      if (mk) params.set('make', mk);
      if (m) params.set('model', m);
      if (y !== null && y !== undefined) params.set('year', String(y));
      const path = params.toString()
        ? `/v1/catalog/categories/${slug}/diagrams?${params}`
        : `/v1/catalog/categories/${slug}/diagrams`;
      return get<Diagram[]>(path);
    },
    enabled: !!slug,
    ...longStale,
  });
}
