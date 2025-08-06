// src/api/user.ts
import { authenticatedAPI } from './apiWithAuth';

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface UserProfileUpdate {
  username?: string;
  email?: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * Get current user profile
 */
export async function getUserProfile() {
  return authenticatedAPI.request<{ user: User }>('/auth/me', {
    method: 'GET',
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(profileData: UserProfileUpdate) {
  return authenticatedAPI.request<{ user: User }>('/auth/me', {
    method: 'PUT',
    body: profileData,
  });
}

/**
 * Change user password
 */
export async function changePassword(passwordData: PasswordChange) {
  return authenticatedAPI.request<{ user: User; message: string }>('/auth/me/password', {
    method: 'PUT',
    body: passwordData,
  });
}