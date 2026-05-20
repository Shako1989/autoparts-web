import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { useTranslation } from 'react-i18next';
import type { PageResponse } from './catalog';

export interface SearchHit {
  partId: string;
  name: string;
  brand: string | null;
  categorySlug: string;
  defaultImageUrl: string | null;
  activeListings: number;
  minPriceMinor: number | null;
  currency: string | null;
}

export function useSearch(q: string, page = 0, size = 20) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'az';
  const enabled = q.trim().length > 0;
  return useQuery<PageResponse<SearchHit>>({
    queryKey: ['search', q.trim(), page, size, lang],
    queryFn: async () => {
      const params = new URLSearchParams({ q: q.trim(), page: String(page), size: String(size) });
      const { data } = await apiClient.get<PageResponse<SearchHit>>(`/v1/search?${params}`);
      return data;
    },
    enabled,
    staleTime: 30_000,
  });
}
