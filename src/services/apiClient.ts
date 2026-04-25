import axios, { type AxiosError } from 'axios';
import type { RequestConfigWithRetry } from '@/types/api';
import type { ApiErrorData } from '@/types/error';
import {
  forceRelogin,
  isSessionExpiredResponse,
  mapForbiddenContext,
  type ForbiddenContext,
} from '@/auth/sessionPolicy';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

const normalizeLoopbackBaseUrl = (rawBaseUrl: string): string => {
  if (typeof window === 'undefined') {
    return rawBaseUrl;
  }

  try {
    const url = new URL(rawBaseUrl, window.location.origin);
    const pageHost = window.location.hostname;
    const isLoopbackHost = pageHost === '127.0.0.1' || pageHost === 'localhost';
    const isLoopbackApiHost = url.hostname === '127.0.0.1' || url.hostname === 'localhost';

    if (!isLoopbackHost || !isLoopbackApiHost) {
      return rawBaseUrl;
    }

    url.hostname = pageHost;
    return url.origin;
  } catch {
    return rawBaseUrl;
  }
};

const resolveApiBaseUrl = (): string => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (configuredBaseUrl) {
    return normalizeLoopbackBaseUrl(configuredBaseUrl);
  }

  return normalizeLoopbackBaseUrl(DEFAULT_API_BASE_URL);
};

export const API_BASE_URL = resolveApiBaseUrl();

type ApiErrorWithForbiddenContext = AxiosError<ApiErrorData> & {
  forbiddenContext?: ForbiddenContext;
};

const LOGIN_ENDPOINTS = ['/auth/login', '/auth/register'];

const shouldBypassAuthRedirect = (url?: string): boolean =>
  LOGIN_ENDPOINTS.some((endpoint) => url?.includes(endpoint));

const normalizeForbiddenPayload = (
  axiosError: ApiErrorWithForbiddenContext,
  forbiddenContext: ForbiddenContext
) => {
  if (!axiosError.response?.data || typeof axiosError.response.data !== 'object') {
    return;
  }

  const responseData = axiosError.response.data as ApiErrorData & { details?: unknown };

  const existingDetails =
    responseData.details &&
    typeof responseData.details === 'object' &&
    !Array.isArray(responseData.details)
      ? (responseData.details as Record<string, unknown>)
      : {};

  axiosError.response.data = {
    ...responseData,
    details: {
      ...existingDetails,
      requiredPermissions: forbiddenContext.requiredPermissions,
      missingPermissions: forbiddenContext.missingPermissions,
    },
  } as ApiErrorData;
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
    const axiosError = error as ApiErrorWithForbiddenContext;
    const statusCode = axiosError.response?.status;
    const url = axiosError.config?.url;
    const originalRequest = axiosError.config as RequestConfigWithRetry;

    if (originalRequest?.skipAuthRedirect) {
      return Promise.reject(axiosError);
    }

    if (statusCode === 403) {
      const forbiddenContext = mapForbiddenContext(axiosError);
      if (forbiddenContext) {
        axiosError.forbiddenContext = forbiddenContext;
        normalizeForbiddenPayload(axiosError, forbiddenContext);
      }

      return Promise.reject(axiosError);
    }

    if (shouldBypassAuthRedirect(url)) {
      return Promise.reject(axiosError);
    }

    if (isSessionExpiredResponse(axiosError)) {
      forceRelogin('session-expired');
      return Promise.reject(axiosError);
    }

    return Promise.reject(axiosError);
  }
);
