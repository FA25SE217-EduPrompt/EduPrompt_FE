export type School = {
    id: number | string;
    name: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
    description?: string;
    establishedYear?: number;
};

export interface JoinSchoolRequest {
    schoolId: number | string;
}

