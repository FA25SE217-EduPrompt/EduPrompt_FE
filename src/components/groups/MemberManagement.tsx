
"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { useGetGroupMembers, useAddMember, useRemoveMember } from "@/hooks/queries/group";
import { useGetUsersInMySchool } from "@/hooks/queries/user";
import { Loader2, Plus, UserX, X as XMarkIcon, ShieldCheck as ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface MemberManagementProps {
    groupId: string;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ groupId }) => {
    const { data: members, isLoading, error } = useGetGroupMembers(groupId);
    const { data: schoolUsers } = useGetUsersInMySchool();
    const addMemberMutation = useAddMember();
    const removeMemberMutation = useRemoveMember();
    const [selectedUserId, setSelectedUserId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const t = useTranslations('Dashboard.Group');

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const availableUsers = React.useMemo(() => {
        if (!schoolUsers?.data || !members?.content) return schoolUsers?.data || [];
        return schoolUsers.data.filter(user =>
            !members.content.some(member => member.userId === user.id)
        );
    }, [schoolUsers, members]);

    const filteredUsers = React.useMemo(() => {
        return availableUsers.filter(user =>
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableUsers, searchTerm]);

    const selectedUser = schoolUsers?.data?.find(u => u.id === selectedUserId);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) return;

        try {
            await addMemberMutation.mutateAsync({
                id: groupId,
                data: { members: [{ userId: selectedUserId }] }
            });
            toast.success(t('addMemberSuccess'));
            setSelectedUserId("");
            setSearchTerm("");
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

            <form onSubmit={handleAddMember} className="flex items-center gap-3 mb-6">
                <div className="flex-1 relative" ref={wrapperRef}>
                    <div
                        className="w-full px-3 h-10 border rounded-lg focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary transition-all bg-white flex items-center cursor-text relative"
                        onClick={() => setIsDropdownOpen(true)}
                    >
                        {selectedUser ? (
                            <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                <span className="text-gray-900 truncate">
                                    {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setSelectedUserId(""); setSearchTerm(""); }}
                                    className="ml-auto text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
                                placeholder={t('addMemberPlaceholder')}
                                className="w-full outline-none text-sm placeholder:text-gray-400"
                                onFocus={() => setIsDropdownOpen(true)}
                            />
                        )}
                    </div>

                    {isDropdownOpen && !selectedUserId && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto z-10 py-1">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => { setSelectedUserId(user.id); setIsDropdownOpen(false); setSearchTerm(`${user.firstName} ${user.lastName}`); }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex flex-col"
                                    >
                                        <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                                        <span className="text-xs text-gray-500">{user.email}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                    {availableUsers.length === 0 ? t('noUsersAvailable') : t('noResults')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={addMemberMutation.isPending || !selectedUserId}
                    className="inline-flex items-center justify-center gap-2 px-4 h-10 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                    {addMemberMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    <span>{t('addMember')}</span>
                </button>
            </form>

            <div className="space-y-4">
                {members?.content && members.content.length > 0 ? (
                    <div className="divide-y relative">
                        {members.content.map((member) => (
                            <div key={member.userId} className="py-4 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium text-lg relative">
                                        {member.avatar ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={member.avatar} alt={member.firstName} className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            <span className="uppercase">{member.firstName?.[0]}{member.lastName?.[0]}</span>
                                        )}
                                        {member.role === 'admin' && (
                                            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white rounded-full p-0.5 border-2 border-white" title="Admin">
                                                <ShieldCheckIcon className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">
                                                {member.firstName} {member.lastName}
                                            </p>
                                            {member.role === 'admin' && (
                                                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                    </div>
                                </div>
                                <div>
                                    {member.role !== 'admin' ? (
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleRemoveMember(member.userId)}
                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 sm:px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title={t('removeMember')}
                                        >
                                            <UserX className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <div className="p-2 sm:px-3 text-gray-300 cursor-not-allowed" title="Cannot remove admin">
                                            <ShieldCheckIcon className="h-4 w-4" />
                                        </div>
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
