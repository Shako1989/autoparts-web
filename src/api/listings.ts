import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { apiClient } from './client';
import { useAuthStore } from '@/store/authStore';
import type { PageResponse } from './catalog';

export type ListingCondition = 'NEW' | 'USED' | 'REFURBISHED';
export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'SOLD' | 'ARCHIVED';

export interface ListingPhoto {
  id: string;
  url: string;
  position: number;
}

export interface ListingPartSummary {
  id: string;
  categoryId: string;
  categorySlug: string;
  name: string;
  brand: string | null;
  defaultImageUrl: string | null;
}

export interface ListingSellerSummary {
  id: string;
  userId: string;
  displayName: string;
  city: string | null;
  contactPhone: string | null;
  whatsapp: string | null;
}

export interface ListingSummary {
  id: string;
  partId: string;
  sellerId: string;
  sellerDisplayName: string | null;
  sellerCity: string | null;
  title: string;
  condition: ListingCondition;
  status: ListingStatus;
  priceMinor: number;
  currency: string;
  quantity: number;
  city: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface ListingDetail {
  id: string;
  title: string;
  description: string | null;
  condition: ListingCondition;
  status: ListingStatus;
  priceMinor: number;
  currency: string;
  quantity: number;
  city: string | null;
  publishedAt: string | null;
  createdAt: string;
  part: ListingPartSummary;
  seller: ListingSellerSummary;
  photos: ListingPhoto[];
}

export interface PartListingStats {
  partId: string;
  activeCount: number;
  minPriceMinor: number | null;
  currency: string | null;
}

export interface CreateListingRequest {
  partId: string;
  title: string;
  description?: string;
  condition: ListingCondition;
  priceMinor: number;
  currency: string;
  quantity: number;
  city?: string;
}

export interface UpdateListingRequest {
  title?: string;
  description?: string;
  condition?: ListingCondition;
  priceMinor?: number;
  currency?: string;
  quantity?: number;
  city?: string;
  status?: ListingStatus;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  s3Key: string;
  publicUrl: string;
  expiresInSeconds: number;
}

const longStale = { staleTime: 60_000 } as const;

export function useListing(listingId: string | undefined, options?: Partial<UseQueryOptions<ListingDetail>>) {
  return useQuery<ListingDetail>({
    queryKey: ['listings', 'detail', listingId],
    queryFn: async () => (await apiClient.get<ListingDetail>(`/v1/listings/${listingId}`)).data,
    enabled: !!listingId,
    ...longStale,
    ...options,
  });
}

export function usePartListings(partId: string | undefined, page = 0, size = 20) {
  return useQuery<PageResponse<ListingSummary>>({
    queryKey: ['parts', partId, 'listings', page, size],
    queryFn: async () =>
      (await apiClient.get<PageResponse<ListingSummary>>(`/v1/parts/${partId}/listings?page=${page}&size=${size}`)).data,
    enabled: !!partId,
    ...longStale,
  });
}

export function usePartListingsSummary(partId: string | undefined) {
  return useQuery<PartListingStats>({
    queryKey: ['parts', partId, 'listings', 'summary'],
    queryFn: async () =>
      (await apiClient.get<PartListingStats>(`/v1/parts/${partId}/listings/summary`)).data,
    enabled: !!partId,
    staleTime: 30_000,
  });
}

export function useMyListings(status?: ListingStatus, page = 0, size = 20) {
  const token = useAuthStore((s) => s.accessToken);
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  params.set('page', String(page));
  params.set('size', String(size));
  return useQuery<PageResponse<ListingSummary>>({
    queryKey: ['my', 'listings', status ?? null, page, size],
    queryFn: async () =>
      (await apiClient.get<PageResponse<ListingSummary>>(`/v1/my/listings?${params}`)).data,
    enabled: !!token,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateListingRequest) => {
      const { data } = await apiClient.post<ListingDetail>('/v1/listings', body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my', 'listings'] }),
  });
}

export function useUpdateListing(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateListingRequest) => {
      const { data } = await apiClient.patch<ListingDetail>(`/v1/listings/${listingId}`, body);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['listings', 'detail', listingId], data);
      queryClient.invalidateQueries({ queryKey: ['my', 'listings'] });
    },
  });
}

export function usePresignPhoto(listingId: string) {
  return useMutation({
    mutationFn: async (contentType: string) => {
      const { data } = await apiClient.post<PresignedUploadResponse>(
        `/v1/listings/${listingId}/photos/presign`,
        { contentType },
      );
      return data;
    },
  });
}

export async function uploadFileToPresignedUrl(uploadUrl: string, file: File): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    transformRequest: [(d) => d],
  });
}

export function useConfirmPhoto(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { s3Key: string; position?: number }) => {
      const { data } = await apiClient.post<ListingPhoto>(`/v1/listings/${listingId}/photos`, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings', 'detail', listingId] }),
  });
}

export function useRemovePhoto(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (photoId: string) => {
      await apiClient.delete(`/v1/listings/${listingId}/photos/${photoId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings', 'detail', listingId] }),
  });
}
