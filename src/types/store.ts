import type { User } from './auth';

export interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
}
