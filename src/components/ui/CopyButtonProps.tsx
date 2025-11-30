import {useState} from "react";
import {toast} from "sonner";

interface CopyButtonProps {
    text: string;
    label?: string;
}

export const CopyButton = ({text, label}: CopyButtonProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!text || !text.trim()) return;

        // Use document.execCommand for iframe compatibility
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy'); //deprecated but working, i've already looked for alter
            if (successful) {
                setCopied(true);
                toast.success(`${label || 'Text'} copied to clipboard`);
                setTimeout(() => setCopied(false), 2000);
            } else {
                toast.error('Failed to copy');
            }
        } catch (err) {
            toast.error('Failed to copy');
        }

        document.body.removeChild(textArea);
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title={`Copy ${label || 'text'}`}
        >
            {copied ? (
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
            )}
        </button>
    );
};