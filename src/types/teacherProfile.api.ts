import { BaseResponse } from './api';

export interface TeacherProfileResponse {
    id: string;
    subjectSpecialty: string;
    gradeLevels: string;
    teachingStyle: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTeacherProfileRequest {
    subjectSpecialty: string;
    gradeLevels: string;
    teachingStyle: string;
}

export interface UpdateTeacherProfileRequest {
    subjectSpecialty: string;
    gradeLevels: string;
    teachingStyle: string;
}

export type TeacherProfileApiResponse = BaseResponse<TeacherProfileResponse>;
