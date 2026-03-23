import axios, { type AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface User {
  id: string;
  phoneNumber: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface ApiErrorData {
  success: boolean;
  statusCode: number;
  code: string;
  message: string;
}

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect';

const unwrapApiData = <T>(payload: T | ApiEnvelope<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    const wrapped = payload as ApiEnvelope<T>;
    if (wrapped.data !== undefined) {
      return wrapped.data;
    }
  }

  return payload as T;
};

const saveCurrentPathForRelogin = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const fullPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (fullPath && fullPath !== '/auth') {
    sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, fullPath);
  }
};

const forceLogoutAndRedirectToAuth = async () => {
  const { useAuthStore } = await import('../stores/authStore');
  useAuthStore.getState().clearAuth();
  saveCurrentPathForRelogin();

  if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
    window.location.href = '/auth';
  }
};

// Create axios instance with proper configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for cookie-based auth
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const axiosError = error as AxiosError<ApiErrorData>;
    const statusCode = axiosError.response?.status;
    const url = axiosError.config?.url;
    const originalRequest = axiosError.config as {
      _retry?: boolean;
      headers?: Record<string, string>;
    };

    // Handle 401 with token refresh and one retry.
    if (
      statusCode === 401 &&
      !url?.includes('/auth/login') &&
      !url?.includes('/auth/register') &&
      !url?.includes('/auth/refresh')
    ) {
      const tokenExpired = axiosError.response?.headers?.['x-token-expired'];
      if (tokenExpired === 'true') {
        await forceLogoutAndRedirectToAuth();
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
          await forceLogoutAndRedirectToAuth();
          return Promise.reject(retryError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API service
export const authApi = {
  // Login with phone number and password
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse | ApiEnvelope<AuthResponse>>(
      '/auth/login',
      data
    );
    const authData = unwrapApiData<AuthResponse>(response.data);

    if (authData.accessToken) {
      localStorage.setItem('accessToken', authData.accessToken);
    }
    if (authData.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken);
    }

    // Prefer cookie auth; avoid stale Authorization headers.
    delete api.defaults.headers.common['Authorization'];

    return authData;
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse | ApiEnvelope<AuthResponse>>(
      '/auth/register',
      data
    );
    const authData = unwrapApiData<AuthResponse>(response.data);

    if (authData.accessToken) {
      localStorage.setItem('accessToken', authData.accessToken);
    }
    if (authData.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken);
    }

    // Prefer cookie auth; avoid stale Authorization headers.
    delete api.defaults.headers.common['Authorization'];

    return authData;
  },

  // Logout (clears tokens and auth state)
  logout: async (): Promise<MessageResponse> => {
    try {
      const response = await api.post<MessageResponse>('/auth/logout');
      return response.data;
    } finally {
      // Clear tokens from storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Remove Authorization header
      delete api.defaults.headers.common['Authorization'];
      // Clear auth state after logout
      const { useAuthStore } = await import('../stores/authStore');
      useAuthStore.getState().clearAuth();
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User | ApiEnvelope<User>>('/auth/me');
    return unwrapApiData<User>(response.data);
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<User | ApiEnvelope<User>>('/auth/profile');
    return unwrapApiData<User>(response.data);
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put<User | ApiEnvelope<User>>('/auth/profile', data);
    return unwrapApiData<User>(response.data);
  },

  // Change password
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/auth/change-password', data);
    return response.data;
  },
};

// Initialize auth - restore token from storage if available
export function initializeAuth() {
  // Cookie-based auth is the source of truth; avoid stale bearer headers.
  delete api.defaults.headers.common['Authorization'];
}

// Legacy class-based service for backward compatibility
class AuthService {
  async login(phoneNumber: string, password: string): Promise<AuthResponse> {
    return authApi.login({ phoneNumber, password });
  }

  async signup(
    phoneNumber: string,
    password: string,
    firstName?: string,
    lastName?: string,
    email?: string
  ): Promise<AuthResponse> {
    return authApi.register({
      phoneNumber,
      password,
      firstName,
      lastName,
      email,
    });
  }

  logout(): void {
    // Import dynamically to avoid circular dependencies
    import('../stores/authStore').then(module => {
      module.useAuthStore.getState().clearAuth();
    });
  }

  getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}

export const authService = new AuthService();
