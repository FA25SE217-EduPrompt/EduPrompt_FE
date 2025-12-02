interface PulsingDotsLoaderProps {
    text?: string;
    variant?: 'purple' | 'blue';
}

export const PulsingDotsLoader = ({text = 'Processing', variant = 'purple'}: PulsingDotsLoaderProps) => {
    const color = variant === 'purple' ? 'bg-purple-600' : 'bg-blue-600';
    const textColor = variant === 'purple' ? 'text-purple-600' : 'text-blue-600';

    return (
        <div className="flex items-center justify-center space-x-2 py-4">
            <span className={`text-sm ${textColor}`}>{text}</span>
            <div className="flex space-x-1">
                <div
                    className={`w-2 h-2 ${color} rounded-full animate-bounce`}
                    style={{animationDelay: '0ms'}}
                />
                <div
                    className={`w-2 h-2 ${color} rounded-full animate-bounce`}
                    style={{animationDelay: '150ms'}}
                />
                <div
                    className={`w-2 h-2 ${color} rounded-full animate-bounce`}
                    style={{animationDelay: '300ms'}}
                />
            </div>
        </div>
    );
};