"use client";
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      setToken(accessToken);
      if (accessToken) {
        setIsAuthenticated(true);
        // Only get user info after successful login, not on every page load
        console.log('Token found, user authenticated');
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInfo = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    
    console.log('Getting user info with token:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('Token type:', tokenType);
    
    const response = await fetch('/api/user/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('User info response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('User info error response:', errorText);
      
      // If unauthorized (401) or forbidden (403), clear auth and throw error
      if (response.status === 401 || response.status === 403) {
        console.error('Token expired or invalid, clearing auth data');
        handleUnauthorized();
        throw new Error('UNAUTHORIZED');
      }
      
      throw new Error('Failed to get user info');
    }

    const userData = await response.json();
    console.log('User data received:', userData);
    setUser(userData);
    return userData;
  }, []);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('token_type', data.token_type);
    
    return data;
  };

  const login = (accessToken, tokenType = 'bearer', refreshToken = null) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('token_type', tokenType);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    setToken(accessToken);
    setIsAuthenticated(true);
    
    // Don't get user info immediately to avoid 401
    // User info will be fetched when needed in dashboard
    console.log('Login successful, token saved');
  };

  const clearAuthData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  // Utility function to check if API response is unauthorized
  const handleUnauthorized = useCallback(() => {
    console.error('Unauthorized access detected - clearing auth and redirecting to login');
    clearAuthData();
    // Force redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const tokenType = localStorage.getItem('token_type');

      if (token) {
        await fetch('/api/auth/logout', {
          method: 'GET',
          headers: {
            'Authorization': `${tokenType || 'Bearer'} ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout,
    checkAuthStatus,
    getUserInfo,
    refreshAccessToken,
    handleUnauthorized
  };

  return (
    <AuthContext.Provider value={value}>
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

export function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-amber-700 font-semibold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return children;
}