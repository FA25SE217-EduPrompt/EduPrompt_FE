interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'page';
    variant?: 'primary' | 'white';
    className?: string;
}

export default function Spinner({ size = 'md', variant = 'primary', className = '' }: SpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',      // Buttons
        md: 'h-8 w-8 border-2',      // Cards
        lg: 'h-16 w-16 border-4',    // Section
        xl: 'h-24 w-24 border-4',    // Hero
        page: 'h-32 w-32 border-4',  // Full Page
    };

    const colorClasses = {
        primary: 'border-brand-secondary', // Sky blue
        white: 'border-white',             // White
    };

    return (
        <div
            className={`animate-spin rounded-full border-b-transparent ${sizeClasses[size]} ${colorClasses[variant]} ${className}`}
            role="status"
        />
    );
}

