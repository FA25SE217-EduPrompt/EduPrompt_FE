"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { decodeJWT, isTokenExpired, shouldRefreshToken, JWTPayload } from '@/utils/jwt';

const SYSTEM_ADMIN_ROLE = 'ADMIN';
const SCHOOL_ADMIN_ROLE = 'SCHOOL_ADMIN';
const TEACHER_ROLE = 'TEACHER';


// Types based on backend API
export interface User {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isVerified?: boolean;
  isActive?: boolean;
  isSystemAdmin?: boolean;
  isSchoolAdmin?: boolean;
  isTeacher?: boolean;
}


export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  loginWithGoogle: (tokenId: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const router = useRouter();

  // Safe localStorage operations
  const safeLocalStorage = {
    get: (key: string): string | null => {
      try {
        if (typeof window !== 'undefined') {
          return localStorage.getItem(key);
        }
        return null;
      } catch (error) {
        console.warn(`localStorage.getItem failed for ${key}:`, error);
        return null;
      }
    },
    set: (key: string, value: string): void => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value);
        }
      } catch (error) {
        console.warn(`localStorage.setItem failed for ${key}:`, error);
      }
    },
    remove: (key: string): void => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.warn(`localStorage.removeItem failed for ${key}:`, error);
      }
    },
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const token = safeLocalStorage.get('token');
      console.log('AuthContext - Initializing auth with token:', token ? 'Present' : 'Not found');
      
      if (token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          console.warn('Token is expired, clearing auth state');
          safeLocalStorage.remove('token');
          safeLocalStorage.remove('user');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // Decode JWT to get user info
        const payload = decodeJWT(token);
        console.log('AuthContext - JWT payload:', payload);
        
        if (payload) {
          const user: User = {
            email: payload.sub,
            firstName: '', // Will be fetched from API
            lastName: '', // Will be fetched from API
            phoneNumber: '', // Will be fetched from API
            isVerified: true, // Assume verified if token is valid
            isActive: true,
            isSystemAdmin: payload.role === SYSTEM_ADMIN_ROLE,
            isSchoolAdmin: payload.role === SCHOOL_ADMIN_ROLE,
            isTeacher: payload.role === TEACHER_ROLE,
          };

          console.log('AuthContext - Setting authenticated state');
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Fetch full user data
          fetchUserData(token);
        } else {
          console.warn('AuthContext - Invalid token, clearing auth state');
          // Invalid token, clear auth state
          safeLocalStorage.remove('token');
          safeLocalStorage.remove('user');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        console.log('AuthContext - No token found, setting unauthenticated state');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Fetch user data from API
  const fetchUserData = useCallback(async (token: string) => {
    try {
      const { getCurrentUser } = await import('@/services/auth');
      const response = await getCurrentUser();
      
      if (response.data && !response.error) {
        const userData = response.data;
        setAuthState(prev => ({
          ...prev,
          user: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            isVerified: userData.isVerified,
            isActive: userData.isActive,
            isSystemAdmin: userData.isSystemAdmin,
            isSchoolAdmin: userData.isSchoolAdmin,
            isTeacher: userData.isTeacher,
          },
        }));
      }
    } catch (error) {
      console.warn('Failed to fetch user data:', error);
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string, remember = false) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const { loginUser } = await import('@/services/auth');
      const response = await loginUser({ email, password });

      if (response.error) {
        throw new Error(response.error.messages?.[0] || 'Login failed');
      }

      const { token } = response.data;
      if (!token) {
        throw new Error('No token received');
      }

      // Decode JWT to get user info
      const payload = decodeJWT(token);
      if (!payload) {
        throw new Error('Invalid token received');
      }

      // Create user object from JWT payload
      const user: User = {
        email: payload.sub,
        firstName: '', // Will be fetched from API
        lastName: '', // Will be fetched from API
        phoneNumber: '', // Will be fetched from API
        isVerified: true, // Assume verified if token is valid
        isActive: true,
        isSystemAdmin: payload.role === SYSTEM_ADMIN_ROLE,
        isSchoolAdmin: payload.role === SCHOOL_ADMIN_ROLE,
        isTeacher: payload.role === TEACHER_ROLE,
      };

      // Store auth data
      safeLocalStorage.set('token', token);
      safeLocalStorage.set('user', JSON.stringify(user));

      if (remember) {
        safeLocalStorage.set('rememberEmail', email);
      } else {
        safeLocalStorage.remove('rememberEmail');
      }

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Fetch full user data
      await fetchUserData(token);

    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [fetchUserData]);

  // Google login function
  const loginWithGoogle = useCallback(async (tokenId: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const { loginWithGoogle } = await import('@/services/auth');
      const response = await loginWithGoogle({ tokenId });

      if (response.error) {
        throw new Error(response.error.messages?.[0] || 'Google login failed');
      }

      const { token } = response.data;
      if (!token) {
        throw new Error('No token received');
      }

      // Decode JWT to get user info
      const payload = decodeJWT(token);
      if (!payload) {
        throw new Error('Invalid token received');
      }

      // Create user object from JWT payload
      const user: User = {
        email: payload.sub,
        firstName: '', // Will be fetched from API
        lastName: '', // Will be fetched from API
        phoneNumber: '', // Will be fetched from API
        isVerified: true, // Google accounts are pre-verified
        isActive: true,
        isSystemAdmin: payload.role === SYSTEM_ADMIN_ROLE,
        isSchoolAdmin: payload.role === SCHOOL_ADMIN_ROLE,
        isTeacher: payload.role === TEACHER_ROLE,
      };

      // Store auth data
      safeLocalStorage.set('token', token);
      safeLocalStorage.set('user', JSON.stringify(user));

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Fetch full user data
      await fetchUserData(token);

    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [fetchUserData]);

  // Register function
  const register = useCallback(async (userData: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const { registerUser } = await import('@/services/auth');
      const response = await registerUser(userData);

      if (response.error) {
        throw new Error(response.error.messages?.[0] || 'Registration failed');
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout API to invalidate token
      const { logout: logoutAPI } = await import('@/services/auth');
      await logoutAPI();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call result
      safeLocalStorage.remove('token');
      safeLocalStorage.remove('user');
      safeLocalStorage.remove('rememberEmail');
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      router.push('/');
    }
  }, [router]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const token = safeLocalStorage.get('token');
      if (!token) {
        throw new Error('No token to refresh');
      }

      const { refreshToken: refreshTokenAPI } = await import('@/services/auth');
      const response = await refreshTokenAPI();

      if (response.error) {
        throw new Error(response.error.messages?.[0] || 'Token refresh failed');
      }

      const { token: newToken } = response.data;
      if (!newToken) {
        throw new Error('No new token received');
      }

      // Update token in storage
      safeLocalStorage.set('token', newToken);

      // Update auth state
      setAuthState(prev => ({
        ...prev,
        token: newToken,
      }));

      return newToken;
    } catch (error) {
      console.warn('Token refresh failed:', error);
      logout();
      throw error;
    }
  }, [logout]);

  // Verify email function
  const verifyEmail = useCallback(async (token: string) => {
    try {
      const { verifyEmail: verifyEmailAPI } = await import('@/services/auth');
      const response = await verifyEmailAPI(token);

      if (response.error) {
        throw new Error(response.error.messages?.[0] || 'Email verification failed');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Resend verification function
  const resendVerification = useCallback(async (email: string) => {
    try {
      const { resendVerification: resendVerificationAPI } = await import('@/services/auth');
      const response = await resendVerificationAPI(email);

      if (response.error) {
        throw new Error(response.error.messages?.[0] || 'Failed to resend verification');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Change password function
  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    try {
      const { changePassword: changePasswordAPI } = await import('@/services/auth');
      const response = await changePasswordAPI({ oldPassword, newPassword });

      if (response.error) {
        throw new Error(response.error.messages?.[0] || 'Password change failed');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Forgot password function
  const forgotPassword = useCallback(async (email: string) => {
    try {
      const { forgotPassword: forgotPasswordAPI } = await import('@/services/auth');
      const response = await forgotPasswordAPI({ email });

      if (response.error) {
        throw new Error(response.error.messages?.[0] || 'Failed to send reset email');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      const { resetPassword: resetPasswordAPI } = await import('@/services/auth');
      const response = await resetPasswordAPI({ token, newPassword });

      if (response.error) {
        throw new Error(response.error.messages?.[0] || 'Password reset failed');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Update user function
  const updateUser = useCallback((userData: Partial<User>) => {
    setAuthState(prev => {
      if (prev.user) {
        const updatedUser = { ...prev.user, ...userData };
        safeLocalStorage.set('user', JSON.stringify(updatedUser));
        return { ...prev, user: updatedUser };
      }
      return prev;
    });
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshToken,
    updateUser,
    verifyEmail,
    resendVerification,
    changePassword,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
