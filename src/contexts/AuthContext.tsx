"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeJWT } from '@/utils/jwt';
import { TokenManager } from '@/utils/tokenManager';
import { BaseResponse } from '@/types/api';

const SYSTEM_ADMIN_ROLE = 'ADMIN';
const SCHOOL_ADMIN_ROLE = 'SCHOOL_ADMIN';
const TEACHER_ROLE = 'TEACHER';


// Types based on backend API
export interface User {
    id?: string;
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
    refreshToken: () => Promise<BaseResponse<RefreshTokenResponse>>;
    updateUser: (userData: Partial<User>) => void;
    verifyEmail: (token: string) => Promise<BaseResponse<VerifyEmailResponse>>;
    resendVerification: (email: string) => Promise<BaseResponse<ResendVerificationResponse>>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<BaseResponse<ChangePasswordResponse>>;
    forgotPassword: (email: string) => Promise<BaseResponse<ForgotPasswordResponse>>;
    resetPassword: (token: string, newPassword: string) => Promise<BaseResponse<ResetPasswordResponse>>;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

// Response DTOs for API endpoints
export interface RefreshTokenResponse {
    token: string;
}

export interface VerifyEmailResponse {
    message: string;
    isVerified: boolean;
}

export interface ResendVerificationResponse {
    message: string;
}

export interface ChangePasswordResponse {
    message: string;
}

export interface ForgotPasswordResponse {
    message: string;
}

export interface ResetPasswordResponse {
    message: string;
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

    // Fetch user data from API
    const fetchUserData = useCallback(async () => {
        try {
            const { getCurrentUser } = await import('@/services/auth');
            const response = await getCurrentUser();

            if (response.data && !response.error) {
                const userData = response.data;
                setAuthState(prev => ({
                    ...prev,
                    user: {
                        id: userData.id,
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
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to fetch user data');
        }
    }, []);

    useEffect(() => {
        const initializeAuth = () => {
            const token = TokenManager.getToken();


            if (token && TokenManager.isAuthenticated()) {
                // Decode JWT to get user info
                const payload = decodeJWT(token);

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

                    setAuthState({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    // Fetch full user data
                    fetchUserData();
                } else {
                    TokenManager.clearTokens();
                    setAuthState({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            } else {
                TokenManager.clearTokens();
                setAuthState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        };

        initializeAuth();
    }, [fetchUserData]);


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

            // Store token using TokenManager
            TokenManager.setToken(token);

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

            // Store remember email preference
            if (remember) {
                try {
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('rememberEmail', email);
                    }
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('Failed to store remember email:', error);
                    }
                }
            } else {
                try {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('rememberEmail');
                    }
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('Failed to remove remember email:', error);
                    }
                }
            }

            setAuthState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
            });

            // Fetch full user data
            await fetchUserData();

        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    }, [fetchUserData]);

    // Google login function
    const loginWithGoogle = useCallback(async (tokenId: string) => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true }));

            const { loginWithGoogle: loginWithGoogleAPI } = await import('@/services/auth');
            const response = await loginWithGoogleAPI({ tokenId });

            if (response.error) {
                throw new Error(response.error.messages?.[0] || 'Google login failed');
            }

            const { token } = response.data;
            if (!token) {
                throw new Error('No token received');
            }

            // Store token using TokenManager
            TokenManager.setToken(token);

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

            setAuthState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
            });

            // Fetch full user data
            await fetchUserData();

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
            if (process.env.NODE_ENV === 'development') {
                console.warn('Logout API call failed:', error);
            }
        } finally {
            // Clear tokens (handled by auth service) and remember email
            try {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('rememberEmail');
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Failed to remove remember email:', error);
                }
            }

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
    const refreshToken = useCallback(async (): Promise<BaseResponse<RefreshTokenResponse>> => {
        try {
            const token = TokenManager.getToken();
            if (!token) {
                throw new Error('No token to refresh');
            }

            const { refreshToken: refreshTokenAPI } = await import('@/services/auth');
            const response = await refreshTokenAPI();

            if (response.error) {
                throw new Error(response.error.messages?.[0] || 'Token refresh failed');
            }

            const newToken = response.data?.token;
            if (!newToken) {
                throw new Error('No new token received');
            }

            // Update auth state with new token
            setAuthState(prev => ({
                ...prev,
                token: newToken,
            }));

            return response;
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Token refresh failed:', error);
            }
            logout();
            throw error;
        }
    }, [logout]);

    // Verify email function
    const verifyEmail = useCallback(async (token: string): Promise<BaseResponse<VerifyEmailResponse>> => {
        try {
            const { verifyEmail: verifyEmailAPI } = await import('@/services/auth');
            const response = await verifyEmailAPI(token);

            if (response.error) {
                throw new Error(response.error.messages?.[0] || 'Email verification failed');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }, []);

    // Resend verification function
    const resendVerification = useCallback(async (email: string): Promise<BaseResponse<ResendVerificationResponse>> => {
        try {
            const { resendVerification: resendVerificationAPI } = await import('@/services/auth');
            const response = await resendVerificationAPI(email);

            if (response.error) {
                throw new Error(response.error.messages?.[0] || 'Failed to resend verification');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }, []);

    // Change password function
    const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<BaseResponse<ChangePasswordResponse>> => {
        try {
            const { changePassword: changePasswordAPI } = await import('@/services/auth');
            const response = await changePasswordAPI({ oldPassword, newPassword });

            if (response.error) {
                throw new Error(response.error.messages?.[0] || 'Password change failed');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }, []);

    // Forgot password function
    const forgotPassword = useCallback(async (email: string): Promise<BaseResponse<ForgotPasswordResponse>> => {
        try {
            const { forgotPassword: forgotPasswordAPI } = await import('@/services/auth');
            const response = await forgotPasswordAPI({ email });

            if (response.error) {
                throw new Error(response.error.messages?.[0] || 'Failed to send reset email');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }, []);

    // Reset password function
    const resetPassword = useCallback(async (token: string, newPassword: string): Promise<BaseResponse<ResetPasswordResponse>> => {
        try {
            const { resetPassword: resetPasswordAPI } = await import('@/services/auth');
            const response = await resetPasswordAPI({ token, newPassword });

            if (response.error) {
                throw new Error(response.error.messages?.[0] || 'Password reset failed');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }, []);

    // Update user function
    const updateUser = useCallback((userData: Partial<User>) => {
        setAuthState(prev => {
            if (prev.user) {
                const updatedUser = { ...prev.user, ...userData };
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
