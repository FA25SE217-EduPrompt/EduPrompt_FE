import { apiClient } from './auth';
import { CreateTeacherProfileRequest, TeacherProfileApiResponse, UpdateTeacherProfileRequest } from '@/types/teacherProfile.api';

// Get my teacher profile
export async function getMyProfile(): Promise<TeacherProfileApiResponse> {
    const response = await apiClient.get('/api/teacher-profile/me');
    return response.data;
}

// Create new teacher profile
export async function createProfile(data: CreateTeacherProfileRequest): Promise<TeacherProfileApiResponse> {
    const response = await apiClient.post('/api/teacher-profile/new', data);
    return response.data;
}

// Update existing teacher profile
export async function updateProfile(data: UpdateTeacherProfileRequest): Promise<TeacherProfileApiResponse> {
    const response = await apiClient.put('/api/teacher-profile', data);
    return response.data;
}
