import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collectionService } from '@/services/resources/collection';
import { CollectionResponse } from '@/types/collection.api';
import Button from '@/components/ui/Button';
import { Loader2, FolderPlus, Folder } from 'lucide-react';
import { AssignCollectionModal } from './AssignCollectionModal';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface GroupCollectionsProps {
    groupId: string;
    isOwner: boolean;
}

export const GroupCollections: React.FC<GroupCollectionsProps> = ({ groupId, isOwner }) => {
    const t = useTranslations('Dashboard.Group');
    const tCommon = useTranslations('Common');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    const { data: collectionsData, isLoading } = useQuery({
        queryKey: ['group-collections', groupId],
        queryFn: async () => {
            // Fetching a large number to ensure we get group collections. 
            // Ideally there should be a proper endpoint for this.
            const response = await collectionService.getMyCollections(0, 100);
            return response;
        },
    });

    const groupCollections = collectionsData?.data?.content?.filter(
        (c: CollectionResponse) => c.groupId === groupId
    ) || [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{t('collections')}</h3>
                {isOwner && (
                    <Button
                        onClick={() => setIsAssignModalOpen(true)}
                        variant="outline"
                        className="px-3 py-1.5 text-sm h-auto"
                    >
                        <FolderPlus className="h-4 w-4 mr-2" />
                        {t('addCollection')}
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
            ) : groupCollections.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <Folder className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">{t('noCollections')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupCollections.map((collection) => (
                        <div
                            key={collection.id}
                            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative"
                        >
                            <Link href={`/dashboard/collections/${collection.id}`} className="block">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Folder className="h-5 w-5 text-indigo-500" />
                                        <h4 className="font-medium text-gray-900 truncate max-w-[150px]" title={collection.name}>
                                            {collection.name}
                                        </h4>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                                    {collection.description || tCommon('noDescription')}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {collection.tags?.length || 0} {t('tags')}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            <AssignCollectionModal
                groupId={groupId}
                open={isAssignModalOpen}
                onOpenChange={setIsAssignModalOpen}
            />
        </div>
    );
};
