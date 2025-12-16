
"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { useGetGroupMembers, useAddMember, useRemoveMember } from "@/hooks/queries/group";
import { Loader2, Plus, UserX } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface MemberManagementProps {
    groupId: string;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ groupId }) => {
    const { data: members, isLoading, error } = useGetGroupMembers(groupId);
    const addMemberMutation = useAddMember();
    const removeMemberMutation = useRemoveMember();
    const [email, setEmail] = useState("");
    const t = useTranslations('Dashboard.Group');

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        try {
            await addMemberMutation.mutateAsync({ id: groupId, data: { email } });
            toast.success(t('addMemberSuccess'));
            setEmail("");
        } catch (error) {
            console.error("Failed to add member", error);
            toast.error(t('addMemberFailed'));
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm(t('removeConfirm'))) return;

        try {
            await removeMemberMutation.mutateAsync({ groupId, userId });
            toast.success(t('removeMemberSuccess'));
        } catch (error) {
            console.error("Failed to remove member", error);
            toast.error(t('removeMemberFailed'));
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-brand-primary" /></div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">{t('error')}</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('members')}</h2>

            <form onSubmit={handleAddMember} className="flex gap-2 mb-6">
                <input
                    type="email"
                    placeholder={t('addMemberPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                />
                <Button type="submit" disabled={addMemberMutation.isPending || !email} className="whitespace-nowrap px-4 py-2">
                    {addMemberMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    {t('addMember')}
                </Button>
            </form>

            <div className="space-y-4">
                {members && members.length > 0 ? (
                    <div className="divide-y">
                        {members.map((member) => (
                            <div key={member.userId} className="py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium text-lg">
                                        {member.avatar ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={member.avatar} alt={member.firstName} className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            <span>{member.firstName?.[0]}{member.lastName?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                    </div>
                                </div>
                                <div>
                                    {member.role !== 'OWNER' && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleRemoveMember(member.userId)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1"
                                        >
                                            <UserX className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">No members yet.</p>
                )}
            </div>
        </div>
    );
};
