import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import type { RequestConfigWithRetry } from '@/types/api';
import type { ApiErrorData } from '@/types/error';
import { setAuthSessionHint } from '@/services/authSession';

const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

const saveCurrentPathForRelogin = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const fullPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (fullPath && fullPath !== '/auth') {
    sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, fullPath);
  }
};

const forceLogoutAndRedirectToAuth = () => {
  useAuthStore.getState().clearAuth();
  setAuthSessionHint(false);
  saveCurrentPathForRelogin();

  if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
    window.location.href = '/auth';
  }
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const axiosError = error as AxiosError<ApiErrorData>;
    const statusCode = axiosError.response?.status;
    const url = axiosError.config?.url;
    const originalRequest = axiosError.config as RequestConfigWithRetry;

    if (originalRequest?.skipAuthRedirect) {
      return Promise.reject(error);
    }

    if (
      statusCode === 401 &&
      !url?.includes('/auth/login') &&
      !url?.includes('/auth/register') &&
      !url?.includes('/auth/refresh')
    ) {
      const tokenExpired = axiosError.response?.headers?.['x-token-expired'];
      if (tokenExpired === 'true') {
        forceLogoutAndRedirectToAuth();
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await api.post('/auth/refresh');

          if (originalRequest.headers?.Authorization) {
            delete originalRequest.headers.Authorization;
          }

          return api(originalRequest);
        } catch (retryError) {
          forceLogoutAndRedirectToAuth();
          return Promise.reject(retryError);
        }
      }
    }

    return Promise.reject(error);
  }
);
