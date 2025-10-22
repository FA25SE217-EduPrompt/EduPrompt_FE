import axios, { AxiosResponse } from 'axios';
import { TokenManager } from '@/utils/tokenManager';

const API_BASE_URL = 'https://eduprompt.up.railway.app/BE';

// Create axios instance with default config
const apiClient = axios.create({
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

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await apiClient.post('/api/auth/refresh-token');
        
        if (response.data.data?.token) {
          const { token } = response.data.data;
          TokenManager.setToken(token);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        TokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Đăng ký
export async function registerUser(data: { email: string; password: string; firstName: string; lastName: string; phoneNumber: string }) {
  const response = await apiClient.post('/api/auth/register', data);
  return response.data;
}

// Đăng nhập
export async function loginUser(data: { email: string; password: string }) {
  const response = await apiClient.post('/api/auth/login', data);
  
  // Store token if login successful
  if (response.data.data?.token) {
    TokenManager.setToken(response.data.data.token);
  }
  
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
  
  // Store token if login successful
  if (response.data.data?.token) {
    TokenManager.setToken(response.data.data.token);
  }
  
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
  const response = await apiClient.post('/api/auth/refresh-token');
  return response.data;
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


