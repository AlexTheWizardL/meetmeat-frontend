import axios from 'axios';
import { API_CONFIG } from './config';

export const apiClient = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.warn(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: unknown) => {
    const err = error instanceof Error ? error : new Error('Request failed');
    return Promise.reject(err);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (__DEV__) {
        console.error('[API Error]', error.response?.status, error.response?.data);
      }

      // Extract user-friendly message from backend error response
      // Backend returns: { success: false, error: { code, message, statusCode } }
      const data = error.response?.data as {
        message?: string;
        error?: { message?: string };
      } | undefined;
      const message = data?.error?.message ?? data?.message ?? error.message;
      return Promise.reject(new Error(message));
    }
    const err = error instanceof Error ? error : new Error('Unknown error');
    return Promise.reject(err);
  }
);
