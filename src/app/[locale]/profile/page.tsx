"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { getMyProfile, createProfile, updateProfile } from "@/services/teacherProfile";
import { TeacherProfileResponse } from "@/types/teacherProfile.api";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";

import { getAllSchools, joinSchool } from "@/services/school";
import { School } from "@/types/school.api";

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const t = useTranslations('Profile');

    const [profile, setProfile] = useState<TeacherProfileResponse | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Primitives for dependency array
    const isTeacher = user?.isTeacher;

    const [schools, setSchools] = useState<School[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | string>("");
    const [isJoiningSchool, setIsJoiningSchool] = useState(false);

    // Form state for teacher profile
    const [formData, setFormData] = useState({
        subjectSpecialty: "",
        gradeLevels: "",
        teachingStyle: ""
    });

    useEffect(() => {
        if (isAuthenticated && isTeacher) {
            fetchData();
        }
    }, [isAuthenticated, isTeacher]);

    const fetchData = async () => {
        setIsLoadingData(true);
        try {
            // Parallel fetching using Promise.all (Vercel best practice: async-parallel)
            const [profileResponse, schoolsResponse] = await Promise.all([
                getMyProfile(),
                getAllSchools(0, 100)
            ]);

            // Handle Profile Data
            if (profileResponse.data) {
                setProfile(profileResponse.data);
                setFormData({
                    subjectSpecialty: profileResponse.data.subjectSpecialty || "",
                    gradeLevels: profileResponse.data.gradeLevels || "",
                    teachingStyle: profileResponse.data.teachingStyle || ""
                });
            }

            // Handle Schools Data
            if (schoolsResponse.data && schoolsResponse.data.content) {
                setSchools(schoolsResponse.data.content);
            }

        } catch (error) {
            console.error("Failed to fetch data", error);
            // We can add more granular error handling here if needed, 
            // but for now catching both is sufficient to prevent crash.
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleCreateOrUpdate = async () => {
        try {
            if (profile) {
                // Update
                const response = await updateProfile(formData);
                if (response.data) {
                    setProfile(response.data);
                    setIsEditing(false);
                    toast.success(t('success.updated'));
                }
            } else {
                // Create
                const response = await createProfile(formData);
                if (response.data) {
                    setProfile(response.data);
                    toast.success(t('success.created'));
                }
            }
        } catch (error) {
            console.error(t('error.save'), error);
            toast.error(t('error.save'));
        }
    };

    const handleJoinSchool = async () => {
        if (!selectedSchoolId) return;
        setIsJoiningSchool(true);
        try {
            await joinSchool({ schoolId: Number(selectedSchoolId) });
            toast.success(t('school.joinSuccess'));
            // Optionally refresh profile or user info if it changes school status
        } catch (error) {
            console.error("Join school failed", error);
            toast.error(t('school.joinError'));
        } finally {
            setIsJoiningSchool(false);
        }
    };

    if (isAuthLoading || isLoadingData) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }

    if (!isAuthenticated) {
        return <div className="text-center mt-10">{t('loginRequired')}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

            {/* Personal Info Section - Read Only */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('personalInfo')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">{t('firstName')}</label>
                        <div className="mt-1 text-gray-900">{user?.firstName}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">{t('lastName')}</label>
                        <div className="mt-1 text-gray-900">{user?.lastName}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">{t('email')}</label>
                        <div className="mt-1 text-gray-900">{user?.email}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">{t('phone')}</label>
                        <div className="mt-1 text-gray-900">{user?.phoneNumber || t('na')}</div>
                    </div>
                </div>
            </div>

            {/* School Information Section */}
            {/* School Information Section */}
            {user?.isTeacher && (
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('school.title')}</h2>
                    <div className="space-y-4">
                        {user.schoolId ? (
                            // User has joined a school
                            <div className="bg-sky-50 border-l-4 border-sky-400 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-sky-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-sky-700">
                                            {user.hasSchoolSubscription
                                                ? t('school.alreadyJoinedWithSubscription')
                                                : t('school.alreadyJoined', { schoolName: schools.find(s => s.id === Number(user.schoolId))?.name || user.schoolId })
                                            }
                                        </p>
                                        <p className="text-sm text-sky-600 mt-1">
                                            {t('school.cannotChangeWarning')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // User has not joined a school
                            <>
                                <div className="flex flex-col sm:flex-row gap-4 items-end">
                                    <div className="flex-grow w-full sm:w-auto">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('school.selectSchool')}</label>
                                        <select
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm border p-2"
                                            value={selectedSchoolId}
                                            onChange={(e) => setSelectedSchoolId(e.target.value)}
                                            disabled={isJoiningSchool}
                                        >
                                            <option value="">{t('school.selectPlaceholder')}</option>
                                            {schools.map((school) => (
                                                <option key={school.id} value={school.id}>
                                                    {school.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Button
                                        onClick={handleJoinSchool}
                                        disabled={!selectedSchoolId || isJoiningSchool}
                                        isLoading={isJoiningSchool}
                                    >
                                        {t('school.join')}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 italic mt-2">
                                    {t('school.cannotChangeWarning')}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Teacher Profile Section */}
            {user?.isTeacher && (
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">{t('teacherProfile')}</h2>
                        {profile && !isEditing && (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                {t('editProfile')}
                            </Button>
                        )}
                    </div>

                    {!profile && !isEditing ? (
                        <div className="text-center py-6">
                            <p className="text-gray-500 mb-4">{t('noProfile')}</p>
                            <Button onClick={() => setIsEditing(true)}>{t('createProfile')}</Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('subjectSpecialty')}</label>
                                {isEditing || !profile ? (
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm border p-2"
                                        value={formData.subjectSpecialty}
                                        onChange={(e) => setFormData({ ...formData, subjectSpecialty: e.target.value })}
                                        placeholder={t('subjectPlaceholder')}
                                    />
                                ) : (
                                    <div className="mt-1 text-gray-900">{profile.subjectSpecialty}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('gradeLevels')}</label>
                                {isEditing || !profile ? (
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm border p-2"
                                        value={formData.gradeLevels}
                                        onChange={(e) => setFormData({ ...formData, gradeLevels: e.target.value })}
                                        placeholder={t('gradeLevelsPlaceholder')}
                                    />
                                ) : (
                                    <div className="mt-1 text-gray-900">{profile.gradeLevels}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('teachingStyle')}</label>
                                {isEditing || !profile ? (
                                    <textarea
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm border p-2"
                                        value={formData.teachingStyle}
                                        onChange={(e) => setFormData({ ...formData, teachingStyle: e.target.value })}
                                        placeholder={t('teachingStylePlaceholder')}
                                    />
                                ) : (
                                    <div className="mt-1 text-gray-900 whitespace-pre-wrap">{profile.teachingStyle}</div>
                                )}
                            </div>

                            {(isEditing || !profile) && (
                                <div className="flex justify-end space-x-3">
                                    {profile && (
                                        <Button variant="ghost" onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                subjectSpecialty: profile.subjectSpecialty,
                                                gradeLevels: profile.gradeLevels,
                                                teachingStyle: profile.teachingStyle
                                            });
                                        }}>
                                            {t('cancel')}
                                        </Button>
                                    )}
                                    <Button onClick={handleCreateOrUpdate}>
                                        {profile ? t('saveChanges') : t('createProfile')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
