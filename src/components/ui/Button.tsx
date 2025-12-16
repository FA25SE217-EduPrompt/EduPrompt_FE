import { Link } from '@/i18n/navigation';
import React, { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, ComponentProps } from 'react';

// Define the variant types
type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'outline-light'
    | 'solid-dark'
    | 'neutral'
    | 'solid'
    | 'outline'
    | 'ghost'
    | 'destructive';

// --- TYPE DEFINITIONS ---

// Base props shared by both links and buttons
interface BaseProps {
    variant?: ButtonVariant;
    children: ReactNode;
    className?: string;
}

// Props for a standard <button>
type ButtonAsButton = BaseProps &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
        href?: never;
    };

// Props for a Next.js <Link>
type ButtonAsLink = BaseProps &
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> & {
        href: ComponentProps<typeof Link>['href']; // Use the exact href type from next-intl Link
        onClick?: never;
    };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

// --- COMPONENT IMPLEMENTATION ---

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    children,
    className = '',
    ...props
}) => {
    // Base classes (shared by all variants)
    const baseClasses =
        'px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out inline-flex items-center justify-center';

    // Variant-specific classes
    let variantClasses = '';
    switch (variant) {
        case 'primary':
            variantClasses = 'btn-primary';
            break;
        case 'secondary':
            variantClasses =
                'btn-secondary px-8 py-4 text-lg font-semibold rounded-lg';
            break;
        case 'outline-light':
            variantClasses =
                'bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-primary';
            break;
        case 'solid-dark':
            variantClasses =
                'bg-brand-primary text-text-on-brand hover:bg-brand-primary/90';
            break;
        case 'neutral':
            variantClasses = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
            break;
        case 'solid':
            variantClasses =
                'bg-brand-secondary text-text-on-brand hover:bg-brand-primary';
            break;
        case 'outline':
            variantClasses =
                'bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white';
            break;
        case 'ghost':
            variantClasses =
                'bg-transparent text-gray-700 hover:bg-gray-100';
            break;
        case 'destructive':
            variantClasses =
                'bg-red-500 text-white hover:bg-red-600';
            break;
    }

    const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

    if ('href' in props && props.href !== undefined) {
        const { href, ...rest } = props;
        return (
            <Link href={href} className={combinedClasses} {...rest}>
                {children}
            </Link>
        );
    }

    return (
        <button className={combinedClasses} {...(props as ButtonAsButton)}>
            {children}
        </button>
    );
};

export default Button;