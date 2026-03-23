import { useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

export interface UserProfile {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export function useCustomerProfile() {
  const { user, setAuth } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(user || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer profile details
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const profileData = await authApi.getProfile();
      setProfile(profileData);
      // Update auth store with fresh data
      if (profileData) {
        setAuth(profileData);
      }
    } catch (err) {
      console.error('Failed to fetch customer profile:', err);
      setError('Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  }, [user?.id, setAuth]);

  // Fetch profile on mount or when user changes
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id, fetchProfile]);

  return {
    profile: profile || user,
    loading,
    error,
    refetch: fetchProfile,
  };
}
