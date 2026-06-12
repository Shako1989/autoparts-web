import axios from 'axios';
import i18n from '@/i18n';
import { useAuthStore } from '@/store/authStore';

export const apiClient = axios.create({
  baseURL:
    import.meta.env['VITE_API_URL'] ??
    (import.meta.env.PROD ? 'https://api.bakuparts.com/api' : '/api'),
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const lang = i18n.resolvedLanguage ?? 'az';
  config.headers.set('Accept-Language', lang);
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && useAuthStore.getState().accessToken) {
      useAuthStore.getState().clear();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);
