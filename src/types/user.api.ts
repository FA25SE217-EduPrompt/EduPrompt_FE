// [SCHOOL_ADMIN_DASHBOARD] - New File
import { BaseResponse } from './api';

export type UserSchoolResponse = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
};

export type ListUserSchoolResponse = BaseResponse<UserSchoolResponse[]>;
