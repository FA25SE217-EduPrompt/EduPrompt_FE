import axios from 'axios';
import { User, UsersResponse } from '@/types/user.types';
import { TokenManager } from '@/utils/tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create axios instance for admin endpoints with authentication
const adminClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // Increased to 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token from cookies
adminClient.interceptors.request.use(
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

/**
 * Get all users from the admin endpoint
 * Requires authentication token
 */
export async function getAllUsers(page: number = 0, size: number = 20): Promise<unknown> {
    const response = await adminClient.get(`/api/v1/admin/users?page=${page}&size=${size}`);
    return response.data;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User> {
    const response = await adminClient.get<User>(`/api/v1/admin/users/${userId}`);
    return response.data;
}

/**
 * Delete user by ID
 */
export async function deleteUser(userId: string): Promise<void> {
    await adminClient.delete(`/api/v1/admin/users/${userId}`);
}
