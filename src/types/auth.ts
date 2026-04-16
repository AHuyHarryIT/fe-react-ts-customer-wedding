export interface User {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
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
  phoneNumber?: string;
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

export type UserProfile = User;
