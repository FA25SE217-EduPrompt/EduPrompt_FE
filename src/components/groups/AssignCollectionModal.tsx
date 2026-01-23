import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionService } from '@/services/resources/collection';
import { toast } from 'sonner';
import { Loader2, Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface AssignCollectionModalProps {
    groupId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const AssignCollectionModal: React.FC<AssignCollectionModalProps> = ({
    groupId,
    open,
    onOpenChange,
}) => {
    const t = useTranslations('Dashboard.Group');
    const queryClient = useQueryClient();
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

    const { data: collectionsData, isLoading } = useQuery({
        queryKey: ['my-collections'],
        queryFn: () => collectionService.getMyCollections(0, 100),
        enabled: open,
    });

    const assignMutation = useMutation({
        mutationFn: (collectionId: string) =>
            collectionService.assignCollectionToGroup({
                collectionId,
                groupId,
            }),
        onSuccess: (data) => {
            if (data.error) {
                toast.error(t('assignCollectionFailed'));
                console.error(data.error);
                return;
            }
            toast.success(t('assignCollectionSuccess'));
            queryClient.invalidateQueries({ queryKey: ['group-collections', groupId] });
            queryClient.invalidateQueries({ queryKey: ['my-collections'] });
            onOpenChange(false);
            setSelectedCollectionId(null);
        },
        onError: (error) => {
            toast.error(t('assignCollectionFailed'));
            console.error(error);
        },
    });

    const handleAssign = () => {
        if (!selectedCollectionId) return;
        assignMutation.mutate(selectedCollectionId);
    };

    const availableCollections = collectionsData?.data?.content?.filter(
        (c) => c.visibility === 'PRIVATE' || (c.visibility !== 'GROUP' && c.groupId !== groupId)
    ) || [];

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">{t('assignCollection')}</h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : availableCollections.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                            <p>{t('noAvailableCollections')}</p>
                            <p className="text-xs mt-1 text-gray-400">{t('createCollectionFirst')}</p>
                        </div>
                    ) : (
                        <div className="h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-2">
                                {availableCollections.map((collection) => (
                                    <div
                                        key={collection.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                                            selectedCollectionId === collection.id
                                                ? "border-indigo-600 bg-indigo-50"
                                                : "border-gray-200 hover:border-indigo-300"
                                        )}
                                        onClick={() => setSelectedCollectionId(collection.id)}
                                    >
                                        <div>
                                            <h4 className="font-medium text-gray-900">{collection.name}</h4>
                                            {collection.description && (
                                                <p className="text-sm text-gray-500 truncate max-w-[300px]">
                                                    {collection.description}
                                                </p>
                                            )}
                                        </div>
                                        {selectedCollectionId === collection.id && (
                                            <Check className="h-5 w-5 text-indigo-600" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-4 border-t bg-gray-50 gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedCollectionId || assignMutation.isPending}
                    >
                        {assignMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4 mr-2" />
                        )}
                        {t('assign')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
