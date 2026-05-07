import axios from 'axios';
import i18n from '@/i18n';

export const apiClient = axios.create({
  baseURL: import.meta.env['VITE_API_URL'] ?? '/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const lang = i18n.resolvedLanguage ?? 'az';
  config.headers.set('Accept-Language', lang);
  return config;
});
