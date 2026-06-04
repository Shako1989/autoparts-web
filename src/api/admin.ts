import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';

import { apiClient } from './client';
import type { PageResponse } from './catalog';
import type { FitmentInput } from './listings';

// ---------- shared types ----------

export type PartNumberType = 'OEM' | 'AFTERMARKET';

export interface AdminCategory {
  id: string;
  parentId: string | null;
  slug: string;
  nameAz: string;
  nameRu: string;
  nameEn: string;
  iconUrl: string | null;
  sortOrder: number;
  childCount: number;
  partCount: number;
}

export interface AdminPartNumberEntry {
  id: string;
  number: string;
  type: PartNumberType;
  source: string | null;
}

export interface AdminFitmentEntry {
  id: string;
  vehicleVariantId: string;
  makeName: string;
  modelName: string;
  year: number;
  trim: string | null;
  engineCode: string | null;
  position: string | null;
}

export interface AdminPart {
  id: string;
  categoryId: string;
  categorySlug: string;
  nameAz: string;
  nameRu: string;
  nameEn: string;
  brand: string | null;
  description: string | null;
  defaultImageUrl: string | null;
  partNumbers: AdminPartNumberEntry[];
  fitments: AdminFitmentEntry[];
}

export interface AdminPartListItem {
  id: string;
  categoryId: string;
  categorySlug: string;
  nameEn: string;
  brand: string | null;
  defaultImageUrl: string | null;
  fits: string[];
  fitsTotal: number;
}

// ---------- request types ----------

export interface CreateCategoryRequest {
  slug: string;
  parentId?: string | null;
  nameAz: string;
  nameRu: string;
  nameEn: string;
  iconUrl?: string | null;
  sortOrder?: number | null;
}

export interface UpdateCategoryRequest {
  nameAz?: string;
  nameRu?: string;
  nameEn?: string;
  iconUrl?: string | null;
  parentId?: string | null;
  sortOrder?: number;
}

export interface CreatePartRequest {
  categoryId: string;
  nameAz: string;
  nameRu: string;
  nameEn: string;
  brand?: string;
  description?: string;
  defaultImageUrl?: string;
}

export interface UpdatePartRequest {
  categoryId?: string;
  nameAz?: string;
  nameRu?: string;
  nameEn?: string;
  brand?: string;
  description?: string;
  defaultImageUrl?: string;
}

export interface CreatePartNumberRequest {
  number: string;
  type: PartNumberType;
  source?: string;
}

// ---------- categories ----------

export function useAdminCategories(options?: Partial<UseQueryOptions<AdminCategory[]>>) {
  return useQuery<AdminCategory[]>({
    queryKey: ['admin', 'categories'],
    queryFn: async () => (await apiClient.get<AdminCategory[]>('/v1/admin/categories')).data,
    staleTime: 30_000,
    ...options,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateCategoryRequest) => {
      const { data } = await apiClient.post<AdminCategory>('/v1/admin/categories', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  });
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateCategoryRequest) => {
      const { data } = await apiClient.patch<AdminCategory>(`/v1/admin/categories/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/v1/admin/categories/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  });
}

// ---------- parts ----------

export function useAdminParts(
  filter: { categoryId?: string | null; q?: string } = {},
  page = 0,
  size = 20,
) {
  const params = new URLSearchParams();
  if (filter.categoryId) params.set('category', filter.categoryId);
  if (filter.q) params.set('q', filter.q);
  params.set('page', String(page));
  params.set('size', String(size));
  return useQuery<PageResponse<AdminPartListItem>>({
    queryKey: ['admin', 'parts', filter.categoryId ?? null, filter.q ?? '', page, size],
    queryFn: async () =>
      (await apiClient.get<PageResponse<AdminPartListItem>>(`/v1/admin/parts?${params}`)).data,
    staleTime: 15_000,
  });
}

export function useAdminPart(id: string | undefined) {
  return useQuery<AdminPart>({
    queryKey: ['admin', 'parts', 'detail', id],
    queryFn: async () => (await apiClient.get<AdminPart>(`/v1/admin/parts/${id}`)).data,
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useCreatePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreatePartRequest) => {
      const { data } = await apiClient.post<AdminPart>('/v1/admin/parts', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts'] }),
  });
}

export function useUpdatePart(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdatePartRequest) => {
      const { data } = await apiClient.patch<AdminPart>(`/v1/admin/parts/${id}`, body);
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(['admin', 'parts', 'detail', id], data);
      qc.invalidateQueries({ queryKey: ['admin', 'parts'] });
    },
  });
}

export function useDeletePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/v1/admin/parts/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts'] }),
  });
}

// ---------- part numbers ----------

export function useAddPartNumber(partId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreatePartNumberRequest) => {
      const { data } = await apiClient.post<AdminPartNumberEntry>(
        `/v1/admin/parts/${partId}/numbers`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts', 'detail', partId] }),
  });
}

export function useRemovePartNumber(partId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (numberId: string) => {
      await apiClient.delete(`/v1/admin/parts/${partId}/numbers/${numberId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts', 'detail', partId] }),
  });
}

// ---------- fitments ----------

export function useAddFitments(partId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fitments: FitmentInput[]) => {
      const { data } = await apiClient.post<{ added: number }>(
        `/v1/admin/parts/${partId}/fitments`, { fitments });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts', 'detail', partId] }),
  });
}

export function useRemoveFitment(partId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fitmentId: string) => {
      await apiClient.delete(`/v1/admin/parts/${partId}/fitments/${fitmentId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts', 'detail', partId] }),
  });
}
