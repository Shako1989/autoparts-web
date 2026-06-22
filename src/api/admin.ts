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

export interface AdminPartCalloutLocation {
  calloutId: string;
  diagramId: string;
  diagramSlug: string;
  diagramTitleEn: string;
  diagramImageUrl: string;
  diagramImageWidth: number;
  diagramImageHeight: number;
  label: string;
  x: number;
  y: number;
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
  calloutLocations: AdminPartCalloutLocation[];
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

// ---------- diagrams ----------

export interface AdminDiagramListItem {
  id: string;
  slug: string;
  titleEn: string;
  categoryId: string | null;
  categorySlug: string | null;
  imageUrl: string;
  calloutCount: number;
}

export interface AdminCalloutEntry {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number | null;
  h: number | null;
  zOrder: number;
  notes: string | null;
  partId: string;
  partName: string;
}

export interface AdminDiagram {
  id: string;
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  categoryId: string | null;
  categorySlug: string | null;
  vehicleVariantId: string | null;
  callouts: AdminCalloutEntry[];
}

export interface CreateDiagramRequest {
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  categoryId?: string | null;
  vehicleVariantId?: string | null;
}

export interface UpdateDiagramRequest {
  titleAz?: string;
  titleRu?: string;
  titleEn?: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  categoryId?: string | null;
  vehicleVariantId?: string | null;
}

export interface CreateCalloutRequest {
  partId: string;
  label: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  zOrder?: number;
  notes?: string;
}

export interface UpdateCalloutRequest {
  partId?: string;
  label?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  zOrder?: number;
  notes?: string;
}

export function useAdminDiagrams(categoryId?: string | null) {
  const params = new URLSearchParams();
  if (categoryId) params.set('category', categoryId);
  return useQuery<AdminDiagramListItem[]>({
    queryKey: ['admin', 'diagrams', categoryId ?? null],
    queryFn: async () =>
      (await apiClient.get<AdminDiagramListItem[]>(
        params.toString() ? `/v1/admin/diagrams?${params}` : '/v1/admin/diagrams',
      )).data,
    staleTime: 15_000,
  });
}

export function useAdminDiagram(id: string | undefined) {
  return useQuery<AdminDiagram>({
    queryKey: ['admin', 'diagrams', 'detail', id],
    queryFn: async () => (await apiClient.get<AdminDiagram>(`/v1/admin/diagrams/${id}`)).data,
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useCreateDiagram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateDiagramRequest) => {
      const { data } = await apiClient.post<AdminDiagram>('/v1/admin/diagrams', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'diagrams'] }),
  });
}

export function useUpdateDiagram(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateDiagramRequest) => {
      const { data } = await apiClient.patch<AdminDiagram>(`/v1/admin/diagrams/${id}`, body);
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(['admin', 'diagrams', 'detail', id], data);
      qc.invalidateQueries({ queryKey: ['admin', 'diagrams'] });
    },
  });
}

export function useDeleteDiagram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/v1/admin/diagrams/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'diagrams'] }),
  });
}

export function useAddCallout(diagramId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateCalloutRequest) => {
      const { data } = await apiClient.post<AdminCalloutEntry>(
        `/v1/admin/diagrams/${diagramId}/callouts`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'diagrams', 'detail', diagramId] }),
  });
}

export function useUpdateCallout(diagramId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ calloutId, body }: { calloutId: string; body: UpdateCalloutRequest }) => {
      const { data } = await apiClient.patch<AdminCalloutEntry>(
        `/v1/admin/diagrams/${diagramId}/callouts/${calloutId}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'diagrams', 'detail', diagramId] }),
  });
}

export function useRemoveCallout(diagramId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (calloutId: string) => {
      await apiClient.delete(`/v1/admin/diagrams/${diagramId}/callouts/${calloutId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'diagrams', 'detail', diagramId] }),
  });
}

// ---------- uploads ----------

export interface AdminPresignedUpload {
  uploadUrl: string;
  s3Key: string;
  publicUrl: string;
  expiresInSeconds: number;
}

export function usePresignCatalogImage() {
  return useMutation({
    mutationFn: async (contentType: string) => {
      const { data } = await apiClient.post<AdminPresignedUpload>(
        '/v1/admin/uploads/catalog-image/presign', { contentType });
      return data;
    },
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

// ---------- vehicle generations ----------

export interface AdminGeneration {
  id: string;
  modelId: string;
  code: string | null;
  name: string;
  slug: string;
  yearFrom: number;
  yearTo: number | null;
  variantCount: number;
}

export interface CreateGenerationRequest {
  code?: string | null;
  name: string;
  slug: string;
  yearFrom: number;
  yearTo?: number | null;
}

export interface UpdateGenerationRequest {
  code?: string | null;
  name?: string;
  slug?: string;
  yearFrom?: number;
  yearTo?: number | null;
}

export interface MoveVariantsRequest {
  targetGenerationId: string;
  variantIds: string[];
}

export interface VehicleVariantResponse {
  id: string;
  generationId: string;
  modelId: string;
  year: number;
  trim: string | null;
  engineCode: string | null;
  bodyType: string | null;
  fuel: string | null;
}

export function useAdminGenerations(modelId: string | undefined) {
  return useQuery<AdminGeneration[]>({
    queryKey: ['admin', 'generations', modelId ?? ''],
    queryFn: async () =>
      (await apiClient.get<AdminGeneration[]>(`/v1/admin/catalog/models/${modelId}/generations`)).data,
    enabled: !!modelId,
    staleTime: 30_000,
  });
}

export function useCreateGeneration(modelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateGenerationRequest) => {
      const { data } = await apiClient.post<AdminGeneration>(
        `/v1/admin/catalog/models/${modelId}/generations`,
        body,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'generations', modelId] }),
  });
}

export function useUpdateGeneration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, modelId, body }: { id: string; modelId: string; body: UpdateGenerationRequest }) => {
      const { data } = await apiClient.patch<AdminGeneration>(
        `/v1/admin/catalog/generations/${id}`,
        body,
      );
      return { data, modelId };
    },
    onSuccess: ({ modelId }) =>
      qc.invalidateQueries({ queryKey: ['admin', 'generations', modelId] }),
  });
}

export function useDeleteGeneration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, modelId }: { id: string; modelId: string }) => {
      await apiClient.delete(`/v1/admin/catalog/generations/${id}`);
      return modelId;
    },
    onSuccess: (modelId) =>
      qc.invalidateQueries({ queryKey: ['admin', 'generations', modelId] }),
  });
}

export function useMoveVariants() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      srcId,
      modelId,
      body,
    }: {
      srcId: string;
      modelId: string;
      body: MoveVariantsRequest;
    }) => {
      const { data } = await apiClient.post<{ moved: number }>(
        `/v1/admin/catalog/generations/${srcId}/move-variants`,
        body,
      );
      return { data, srcId, modelId, targetId: body.targetGenerationId };
    },
    onSuccess: ({ srcId, modelId, targetId }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'generations', modelId] });
      qc.invalidateQueries({ queryKey: ['admin', 'generation-variants', srcId] });
      qc.invalidateQueries({ queryKey: ['admin', 'generation-variants', targetId] });
    },
  });
}

export function useVariantsForGeneration(generationId: string | undefined) {
  return useQuery<VehicleVariantResponse[]>({
    queryKey: ['admin', 'generation-variants', generationId ?? ''],
    queryFn: async () => {
      const years = (
        await apiClient.get<number[]>(`/v1/catalog/generations/${generationId}/years`)
      ).data;
      if (years.length === 0) return [];
      const perYear = await Promise.all(
        years.map((y) =>
          apiClient
            .get<VehicleVariantResponse[]>(
              `/v1/catalog/variants?generation=${generationId}&year=${y}`,
            )
            .then((r) => r.data),
        ),
      );
      return perYear.flat();
    },
    enabled: !!generationId,
    staleTime: 30_000,
  });
}
