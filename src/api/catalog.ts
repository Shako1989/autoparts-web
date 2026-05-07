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

// ---------- query keys ----------

const KEY = {
  makes: ['catalog', 'makes'] as const,
  models: (makeSlug: string) => ['catalog', 'models', makeSlug] as const,
  years: (modelId: string) => ['catalog', 'years', modelId] as const,
  variants: (modelId: string, year: number) => ['catalog', 'variants', modelId, year] as const,
  tree: (lang: string) => ['catalog', 'tree', lang] as const,
  category: (slug: string, lang: string) => ['catalog', 'category', slug, lang] as const,
  part: (id: string, lang: string) => ['catalog', 'part', id, lang] as const,
  fitments: (partId: string) => ['catalog', 'fitments', partId] as const,
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
