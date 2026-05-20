import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '@/store/authStore';

export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface SellerProfile {
  id: string;
  userId: string;
  displayName: string;
  legalName: string | null;
  city: string | null;
  contactPhone: string | null;
  whatsapp: string | null;
  bio: string | null;
  kycStatus: KycStatus;
  ratingAvg: string;
  ratingCount: number;
}

export interface BecomeSellerRequest {
  displayName: string;
  legalName?: string;
  city?: string;
  contactPhone?: string;
  whatsapp?: string;
  bio?: string;
}

export interface UpdateSellerProfileRequest {
  displayName?: string;
  legalName?: string;
  city?: string;
  contactPhone?: string;
  whatsapp?: string;
  bio?: string;
}

export function useMySellerProfile(options?: Partial<UseQueryOptions<SellerProfile>>) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<SellerProfile>({
    queryKey: ['my', 'seller'],
    queryFn: async () => (await apiClient.get<SellerProfile>('/v1/my/seller')).data,
    enabled: !!token,
    retry: false,
    ...options,
  });
}

export function useBecomeSeller() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: BecomeSellerRequest) => {
      const { data } = await apiClient.post<SellerProfile>('/v1/my/seller', body);
      return data;
    },
    onSuccess: async (profile) => {
      const auth = useAuthStore.getState();
      if (auth.user && auth.user.role === 'BUYER') {
        auth.setSession(
          { accessToken: auth.accessToken ?? '', refreshToken: auth.refreshToken ?? '' },
          { ...auth.user, role: 'SELLER' },
        );
      }
      queryClient.setQueryData(['my', 'seller'], profile);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useUpdateMySellerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateSellerProfileRequest) => {
      const { data } = await apiClient.patch<SellerProfile>('/v1/my/seller', body);
      return data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['my', 'seller'], profile);
    },
  });
}
