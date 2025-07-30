// src/api/apiWithAuth.ts
import { apiRequest, APIResponse } from './base';
import { refreshToken } from './auth';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

class AuthenticatedAPIClient {
  private static instance: AuthenticatedAPIClient;
  private refreshPromise: Promise<string | null> | null = null;

  static getInstance(): AuthenticatedAPIClient {
    if (!AuthenticatedAPIClient.instance) {
      AuthenticatedAPIClient.instance = new AuthenticatedAPIClient();
    }
    return AuthenticatedAPIClient.instance;
  }

  private async getValidToken(): Promise<string | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // Check if token is close to expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // If token expires in less than 5 minutes, refresh it
      if (timeUntilExpiry < 5 * 60 * 1000) {
        return await this.refreshTokenIfNeeded(token);
      }

      return token;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return token;
    }
  }

  private async refreshTokenIfNeeded(currentToken: string): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh(currentToken);
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    
    return result;
  }

  private async performTokenRefresh(currentToken: string): Promise<string | null> {
    try {
      const response = await refreshToken(currentToken);
      if (response.status === 'success' && response.data?.access_token) {
        const newToken = response.data.access_token;
        localStorage.setItem('token', newToken);
        return newToken;
      } else {
        // Refresh failed, clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('token');
      window.location.href = '/login';
      return null;
    }
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<APIResponse<T>> {
    const token = await this.getValidToken();
    
    if (!token) {
      return { status: 'error', error: 'No valid token available' };
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = await apiRequest<T>(endpoint, {
      ...options,
      headers,
    });

    // If we get a token expired error, try to refresh and retry once
    if (response.status === 'error' && 
        (response.error?.includes('Token has expired') || 
         response.error?.includes('Subject must be a string') ||
         response.error?.includes('Invalid token'))) {
      
      const refreshedToken = await this.refreshTokenIfNeeded(token);
      if (refreshedToken) {
        const retryHeaders = {
          ...options.headers,
          Authorization: `Bearer ${refreshedToken}`,
        };
        
        return await apiRequest<T>(endpoint, {
          ...options,
          headers: retryHeaders,
        });
      }
    }

    return response;
  }
}

export const authenticatedAPI = AuthenticatedAPIClient.getInstance();