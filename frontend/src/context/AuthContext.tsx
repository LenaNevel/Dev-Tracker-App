// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { refreshToken } from '../api/auth';

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  refreshAuthToken: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear timers
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    
    // Redirect to login page
    router.push('/login');
  }, [router]);

  const refreshAuthToken = useCallback(async (): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const response = await refreshToken(token);
      if (response.status === 'success' && response.data?.access_token) {
        const newToken = response.data.access_token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  }, [token, logout]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    
    if (isAuthenticated) {
      inactivityTimer.current = setTimeout(() => {
        console.log('User inactive for 30 minutes, logging out...');
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [isAuthenticated, logout]);

  const setupTokenRefresh = useCallback((currentToken: string) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    
    try {
      // Decode JWT to get expiry time (simple base64 decode)
      const payload = JSON.parse(atob(currentToken.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilRefresh = expiryTime - currentTime - REFRESH_THRESHOLD;
      
      if (timeUntilRefresh > 0) {
        refreshTimer.current = setTimeout(async () => {
          console.log('Auto-refreshing token...');
          await refreshAuthToken();
        }, timeUntilRefresh);
      } else {
        // Token is already close to expiry, refresh immediately
        refreshAuthToken();
      }
    } catch (error) {
      console.error('Error setting up token refresh:', error);
    }
  }, [refreshAuthToken]);

  // Track user activity for inactivity logout
  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    if (isAuthenticated) {
      activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });
      resetInactivityTimer();
    }

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isAuthenticated, resetInactivityTimer]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      setupTokenRefresh(storedToken);
    }
  }, [setupTokenRefresh]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    setupTokenRefresh(newToken);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout, refreshAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
