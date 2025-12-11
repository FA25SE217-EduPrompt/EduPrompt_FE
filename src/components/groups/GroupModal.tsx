
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CreateGroupRequest } from "@/types/group.api";
import { useCreateGroup, useUpdateGroup } from "@/hooks/queries/group";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface GroupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingGroup?: {
        id: string;
        name: string;
        description?: string;
    } | null;
}

export const GroupModal: React.FC<GroupModalProps> = ({ open, onOpenChange, editingGroup }) => {
    const t = useTranslations('Dashboard.GroupModal');
    const toastT = useTranslations('Dashboard.Group');
    const createGroup = useCreateGroup();
    const updateGroup = useUpdateGroup();
    const isEditing = !!editingGroup;

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateGroupRequest>({
        defaultValues: {
            name: "",
            description: "",
        },
    });

    useEffect(() => {
        if (open && editingGroup) {
            setValue("name", editingGroup.name);
            setValue("description", editingGroup.description || "");
        } else if (open) {
            reset({
                name: "",
                description: "",
            });
        }
    }, [editingGroup, setValue, reset, open]);

    const onSubmit = async (data: CreateGroupRequest) => {
        try {
            if (isEditing && editingGroup) {
                await updateGroup.mutateAsync({ id: editingGroup.id, data });
                toast.success(toastT('saveSuccess'));
            } else {
                await createGroup.mutateAsync(data);
                toast.success(toastT('saveSuccess'));
            }
            onOpenChange(false);
            reset();
        } catch (error) {
            console.error("Failed to save group", error);
            toast.error(toastT('saveFailed'));
        }
    };

    const isPending = createGroup.isPending || updateGroup.isPending;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{isEditing ? t('editTitle') : t('createTitle')}</h2>
                        <p className="text-sm text-gray-500">{isEditing ? t('editDesc') : t('createDesc')}</p>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('name')}
                        </label>
                        <input
                            {...register("name", { required: "Name is required" })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                            placeholder={t('namePlaceholder')}
                        />
                        {errors.name && (
                            <span className="text-sm text-red-500">{errors.name.message}</span>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('description')}
                        </label>
                        <textarea
                            {...register("description")}
                            placeholder={t('descriptionPlaceholder')}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all resize-none"
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end pt-4 gap-3">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? t('save') : t('create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

