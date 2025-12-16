import React from 'react';
import { ShareIcon, XMarkIcon, ClipboardDocumentIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareToken?: string; // If already shared (this might be the full URL from backend)
    promptId: string;
    onShare: () => void;
    onRevoke: () => void;
    isLoading: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareToken, promptId, onShare, onRevoke, isLoading }) => {
    if (!isOpen) return null;

    // The backend might return a full URL like "http://backend/api/prompt-share/shared/{id}?token={token}"
    // OR just a token. We need to handle both cases to be robust.
    // If it's a URL, we extract the token.

    let token = shareToken;
    try {
        if (shareToken && (shareToken.startsWith('http') || shareToken.includes('?token='))) {
            const url = new URL(shareToken);
            token = url.searchParams.get('token') || undefined;
        }
    } catch (e) {
        console.error("Failed to parse share token url", e);
        // Fallback: if it's not a valid URL but has content, maybe it's just the token or a weird string.
        // If it looks like a UUID, we assume it's the token.
    }

    const shareUrl = token ? `${window.location.origin}/share/${promptId}?token=${token}` : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <ShareIcon className="w-5 h-5 text-blue-600" />
                        Share Prompt
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-600">
                        Share this prompt with others via a public link. Anyone with the link can view the prompt.
                    </p>

                    {shareToken ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    title="Copy Link"
                                >
                                    <ClipboardDocumentIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <button
                                onClick={onRevoke}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrashIcon className="w-4 h-4" />}
                                Revoke Link
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onShare}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Generating Link...</span>
                                </>
                            ) : (
                                <>
                                    <ShareIcon className="w-4 h-4" />
                                    <span>Generate Share Link</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
