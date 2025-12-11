import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
    className?: string; // Additional classes if needed
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    return (
        <div className={`prose prose-sm max-w-none prose-blue ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Ensure tables have nice scrolling if they are too wide
                    table: ({ ...props }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200" {...props} />
                        </div>
                    ),
                    thead: ({ ...props }) => <thead className="bg-gray-50" {...props} />,
                    th: ({ ...props }) => <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b" {...props} />,
                    td: ({ ...props }) => <td className="px-3 py-2 text-sm text-gray-500 border-b whitespace-pre-wrap" {...props} />, // whitespace-pre-wrap handles newlines in cells if any
                    p: ({ ...props }) => <p className="leading-relaxed mb-2 last:mb-0" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1" {...props} />,
                    li: ({ ...props }) => <li className="pl-1" {...props} />,
                    h1: ({ ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900" {...props} />,
                    h2: ({ ...props }) => <h2 className="text-lg font-bold mt-3 mb-2 text-gray-800" {...props} />,
                    h3: ({ ...props }) => <h3 className="text-md font-semibold mt-3 mb-1 text-gray-800" {...props} />,
                    blockquote: ({ ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2" {...props} />,
                    code: ({ className, children, node, ...props }) => { // Correctly typed props
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !parsedIsBlock(node); // simplified check
                        return isInline ? (
                            <code className="px-1 py-0.5 rounded bg-gray-100 text-red-500 font-mono text-xs" {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className={`block bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto font-mono text-xs my-2 ${className || ''}`} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

// Helper to guess if code is block or inline based on node position (simplified)
// In newer react-markdown, we might rely on the `inline` prop if passed, or just presence of language class + structure.
// However, the `code` component in react-markdown v9 receives `inline` prop. 
// Let's refine the type if needed or just use simple styling.
// For now, I'll assume standard usage.
// Note: `react-markdown` v9 `components` prop `code` receives `inline?: boolean`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsedIsBlock(node: any) {
    // This is a naive check; relying on class `language-` is usually safer for highlighting.
    // But `react-markdown` passes `inline` prop.
    return node?.position?.start.line !== node?.position?.end.line;
}
