
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useGetMyPrompts, useAddPromptToCollection } from "@/hooks/queries/prompt";
import { Loader2, CheckCircle, Search, X } from "lucide-react";
import { toast } from "sonner";
import { PromptResponse } from "@/types/prompt.api";
import Button from "@/components/ui/Button";

interface AddPromptToCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
}

export const AddPromptToCollectionModal: React.FC<AddPromptToCollectionModalProps> = ({
    isOpen,
    onClose,
    collectionId,
}) => {
    const t = useTranslations("Dashboard.Collections.AddPromptModal");
    // State
    const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    // Queries & Mutations
    // Fetching large page size to handle client-side filtering comfortably for now
    const { data: promptsResponse, isLoading: isLoadingPrompts } = useGetMyPrompts(0, 100, undefined, { enabled: isOpen });
    const { mutate: addPromptToCollection, isPending: isAdding } = useAddPromptToCollection();

    const prompts = promptsResponse?.data?.content || [];

    // Filter locally
    const filteredPrompts = prompts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedPromptIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedPromptIds(newSet);
    };

    const handleAddSequentially = () => {
        const total = selectedPromptIds.size;

        if (total === 0) return;

        // Fire and forget style loop for now, as we don't have batch API
        // In a real scenario with many items, we should chain promises or use Promise.all
        // However, react-query mutation is a hook wrapper. 
        // We will trigger them and close the modal.

        Array.from(selectedPromptIds).forEach(promptId => {
            addPromptToCollection({ promptId, collectionId });
        });

        toast.success(`Adding ${total} prompts to collection`);
        onClose();
        setSelectedPromptIds(new Set());
        setSearchQuery("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 border-gray-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px]">
                    {isLoadingPrompts ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                        </div>
                    ) : filteredPrompts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-sm">
                            {prompts.length === 0 ? t('noPrompts') : t('noPrompts')}
                        </div>
                    ) : (
                        filteredPrompts.map((prompt: PromptResponse) => {
                            const isSelected = selectedPromptIds.has(prompt.id);
                            return (
                                <div
                                    key={prompt.id}
                                    onClick={() => toggleSelection(prompt.id)}
                                    className={`
                                        group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                                        ${isSelected
                                            ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary"
                                            : "border-gray-100 hover:border-brand-primary/50 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    <div className="min-w-0 flex-1 mr-3">
                                        <h4 className={`font-medium text-sm truncate ${isSelected ? 'text-brand-primary' : 'text-gray-900'}`}>
                                            {prompt.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {prompt.description || "No description"}
                                        </p>
                                    </div>
                                    <div className={`
                                        w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                        ${isSelected
                                            ? "bg-brand-primary border-brand-primary text-white"
                                            : "border-gray-300 text-transparent group-hover:border-gray-400"
                                        }
                                    `}>
                                        <CheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="px-4 py-2 h-auto text-sm">
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleAddSequentially}
                        disabled={selectedPromptIds.size === 0 || isAdding}
                        variant="solid-dark"
                        className="px-4 py-2 h-auto text-sm"
                    >
                        {isAdding ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {t('add')} {selectedPromptIds.size > 0 ? `(${selectedPromptIds.size})` : ""}
                    </Button>
                </div>
            </div>
        </div>
    );
};
