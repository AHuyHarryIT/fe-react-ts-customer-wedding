import type {
  User,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AuthResponse,
  MessageResponse,
} from '@/types/auth';
import type { ApiEnvelope, RequestConfigWithRetry } from '@/types/api';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/apiClient';
import { setAuthSessionHint } from '@/services/authSession';

let initializeAuthPromise: Promise<User | null> | null = null;

const unwrapApiData = <T>(payload: T | ApiEnvelope<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    const wrapped = payload as ApiEnvelope<T>;
    if (wrapped.data !== undefined) {
      return wrapped.data;
    }
  }

  return payload as T;
};

const normalizeUser = (incoming: User): User => ({
  ...incoming,
  firstName: incoming.firstName ?? undefined,
  lastName: incoming.lastName ?? undefined,
  email: incoming.email ?? undefined,
});

// Auth API service
export const authApi = {
  // Login with phone number and password
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse | ApiEnvelope<AuthResponse>>('/auth/login', data);
    const authData = unwrapApiData<AuthResponse>(response.data);

    // Prefer cookie auth; avoid stale Authorization headers.
    delete api.defaults.headers.common['Authorization'];
    setAuthSessionHint(true);

    return {
      ...authData,
      user: normalizeUser(authData.user),
    };
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse | ApiEnvelope<AuthResponse>>(
      '/auth/register',
      data
    );
    const authData = unwrapApiData<AuthResponse>(response.data);

    // Prefer cookie auth; avoid stale Authorization headers.
    delete api.defaults.headers.common['Authorization'];
    setAuthSessionHint(true);

    return {
      ...authData,
      user: normalizeUser(authData.user),
    };
  },

  // Logout (clears tokens and auth state)
  logout: async (): Promise<MessageResponse> => {
    try {
      const response = await api.post<MessageResponse>('/auth/logout');
      return response.data;
    } finally {
      delete api.defaults.headers.common['Authorization'];
      setAuthSessionHint(false);
      useAuthStore.getState().clearAuth();
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User | ApiEnvelope<User>>('/auth/me', {
      skipAuthRedirect: true,
    } as RequestConfigWithRetry);
    return normalizeUser(unwrapApiData<User>(response.data));
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<User | ApiEnvelope<User>>('/auth/profile');
    return normalizeUser(unwrapApiData<User>(response.data));
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put<User | ApiEnvelope<User>>('/auth/profile', data);
    return normalizeUser(unwrapApiData<User>(response.data));
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/auth/change-password', data);
    return response.data;
  },
};

export async function initializeAuth(force = false): Promise<User | null> {
  const authStore = useAuthStore.getState();

  if (!force && authStore.isInitialized) {
    return authStore.user;
  }

  if (!force && initializeAuthPromise) {
    return initializeAuthPromise;
  }

  initializeAuthPromise = (async () => {
    delete api.defaults.headers.common['Authorization'];
    authStore.setLoading(true);
    authStore.setError(null);

    try {
      const user = await authApi.getCurrentUser();
      authStore.setAuth(user);
      setAuthSessionHint(true);
      return user;
    } catch {
      setAuthSessionHint(false);
      authStore.clearAuth();
      return null;
    } finally {
      authStore.setInitialized(true);
      authStore.setLoading(false);
      initializeAuthPromise = null;
    }
  })();

  return initializeAuthPromise;
}
