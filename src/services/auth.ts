import axios from 'axios';
import {TokenManager} from '@/utils/tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Refresh stampede protection
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null, error?: Error) => void> = [];

// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create a clean axios instance for refresh calls (no interceptors)
const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = TokenManager.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh with stampede protection
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Guard against refresh endpoint to prevent infinite loops
        if (originalRequest.url?.includes('/refresh-token')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    refreshSubscribers.push((token: string | null, error?: Error) => {
                        if (token) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(apiClient(originalRequest));
                        } else {
                            reject(error || new Error('Token refresh failed'));
                        }
                    });
                });
            }

            isRefreshing = true;

            try {
                // Use clean client for refresh to avoid interceptor loops
                const token = TokenManager.getToken();
                const refreshResponse = await refreshClient.post('/api/auth/refresh-token', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(refreshResponse.data);
                // Handle API response envelope structure
                if (refreshResponse.data?.data?.token) {
                    const newToken = refreshResponse.data.data.token;
                    TokenManager.setToken(newToken);

                    // Notify all queued requests with success
                    refreshSubscribers.forEach(callback => callback(newToken));
                    refreshSubscribers = [];

                    // Retry the original request
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                } else if (refreshResponse.data?.error) {
                    // Handle API error envelope
                    console.error('Refresh token failed:', refreshResponse.data.error);
                    throw new Error(refreshResponse.data.error.messages?.[0] || 'Token refresh failed');
                } else {
                    throw new Error('Invalid refresh token response');
                }
            } catch (refreshError) {
                // Refresh failed, reject all queued requests
                refreshSubscribers.forEach(callback => {
                    callback(null, refreshError as Error);
                });
                refreshSubscribers = [];

                TokenManager.clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Đăng ký
export async function registerUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string
}) {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
}

// Đăng nhập
export async function loginUser(data: { email: string; password: string }) {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
}

// Đặt lại mật khẩu
export async function resetPassword(data: { token: string; newPassword: string }) {
    const response = await apiClient.post('/api/auth/reset-password', data);
    return response.data;
}

// Đăng nhập với Google SSO
export async function loginWithGoogle(data: { tokenId: string }) {
    const response = await apiClient.post('/api/auth/google', data);
    return response.data;
}

// Quên mật khẩu
export async function forgotPassword(data: { email: string }) {
    const response = await apiClient.post('/api/auth/forgot-password', data);
    return response.data;
}

// Get current user
export async function getCurrentUser() {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
}

// Update user profile
export async function updateProfile(data: { firstName?: string; lastName?: string; phoneNumber?: string }) {
    const response = await apiClient.put('/api/auth/profile', data);
    return response.data;
}

// Change password
export async function changePassword(data: { oldPassword: string; newPassword: string }) {
    const response = await apiClient.post('/api/auth/change-password', data);
    return response.data;
}

// Logout
export async function logout() {
    try {
        await apiClient.post('/api/auth/logout');
    } catch (error) {
        console.warn('Logout request failed:', error);
    } finally {
        TokenManager.clearTokens();
    }
}

// Refresh token
export async function refreshToken() {
    const token = TokenManager.getToken();
    const response = await refreshClient.post('/api/auth/refresh-token', {}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    // Handle API response envelope structure
    if (response.data?.data?.token) {
        const newToken = response.data.data.token;
        TokenManager.setToken(newToken);
        return {data: {token: newToken}, error: null};
    } else if (response.data?.error) {
        return {data: null, error: response.data.error};
    } else {
        throw new Error('Invalid refresh token response');
    }
}

// Verify email
export async function verifyEmail(token: string) {
    const response = await apiClient.get(`/api/auth/verify-email?token=${token}`);
    return response.data;
}

// Resend verification email
export async function resendVerification(email: string) {
    const response = await apiClient.post(`/api/auth/resend-verification?email=${email}`);
    return response.data;
}


