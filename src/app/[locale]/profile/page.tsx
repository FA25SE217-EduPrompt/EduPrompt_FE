"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { getMyProfile, createProfile, updateProfile } from "@/services/teacherProfile";
import { TeacherProfileResponse } from "@/types/teacherProfile.api";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const t = useTranslations('Profile');

    const [profile, setProfile] = useState<TeacherProfileResponse | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form state for teacher profile
    const [formData, setFormData] = useState({
        subjectSpecialty: "",
        gradeLevels: "",
        teachingStyle: ""
    });

    useEffect(() => {
        if (isAuthenticated && user?.isTeacher) {
            fetchProfile();
        }
    }, [isAuthenticated, user]);

    const fetchProfile = async () => {
        setIsLoadingProfile(true);
        try {
            const data = await getMyProfile();
            if (data.data) {
                setProfile(data.data);
                setFormData({
                    subjectSpecialty: data.data.subjectSpecialty || "",
                    gradeLevels: data.data.gradeLevels || "",
                    teachingStyle: data.data.teachingStyle || ""
                });
            }
        } catch (error) {
            // Assume 404 or empty means no profile yet, so we just stay at null
            console.error(t('error.fetch'), error);
        } finally {
            setIsLoadingProfile(false);
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

    if (isAuthLoading || isLoadingProfile) {
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
