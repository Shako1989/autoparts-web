import { useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore, type AuthUser } from '@/store/authStore';

export type OtpPurpose = 'LOGIN' | 'REGISTER';

export interface MeResponse {
  id: string;
  phone: string;
  email: string | null;
  fullName: string | null;
  role: 'BUYER' | 'SELLER' | 'STAFF' | 'ADMIN';
  hasSellerProfile: boolean;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  expiresAt: string;
  user: MeResponse;
}

export interface OtpRequestBody {
  phone: string;
  email?: string;
  purpose: OtpPurpose;
}

export interface OtpVerifyBody {
  phone: string;
  code: string;
  fullName?: string;
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: async (body: OtpRequestBody) => {
      await apiClient.post('/v1/auth/otp/request', body);
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (body: OtpVerifyBody) => {
      const { data } = await apiClient.post<TokenResponse>('/v1/auth/otp/verify', body);
      return data;
    },
    onSuccess: (data) => {
      const user: AuthUser = {
        id: data.user.id,
        phone: data.user.phone,
        fullName: data.user.fullName ?? undefined,
        role: data.user.role,
      };
      useAuthStore.getState().setSession({ accessToken: data.accessToken, refreshToken: '' }, user);
    },
  });
}

export function useMe(options?: Partial<UseQueryOptions<MeResponse>>) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<MeResponse>({
    queryKey: ['auth', 'me'],
    queryFn: async () => (await apiClient.get<MeResponse>('/v1/auth/me')).data,
    enabled: !!token,
    staleTime: 60_000,
    ...options,
  });
}

export interface DevOtpResponse {
  phone: string;
  code: string;
}

export function useDevOtp(phone: string | undefined) {
  return useQuery<DevOtpResponse>({
    queryKey: ['dev', 'otp', phone],
    queryFn: async () => {
      const { data } = await apiClient.get<DevOtpResponse>(
        `/v1/dev/otp/${encodeURIComponent(phone ?? '')}`,
      );
      return data;
    },
    enabled: false,
    retry: false,
    staleTime: 0,
  });
}
