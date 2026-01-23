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

import Spinner from '@/components/ui/Spinner';

// --- TYPE DEFINITIONS ---

// Base props shared by both links and buttons
interface BaseProps {
    variant?: ButtonVariant;
    isLoading?: boolean;
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
    isLoading = false,
    children,
    className = '',
    ...props
}) => {
    // Base classes (shared by all variants)
    const baseClasses =
        'px-8 py-4 rounded-lg text-lg font-semibold transition-transform duration-100 ease-in-out inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95';

    // Variant-specific classes
    let variantClasses = '';
    let spinnerVariant: 'primary' | 'white' = 'white';

    switch (variant) {
        case 'primary':
            variantClasses = 'btn-primary';
            spinnerVariant = 'white';
            break;
        case 'secondary':
            variantClasses =
                'btn-secondary px-8 py-4 text-lg font-semibold rounded-lg';
            spinnerVariant = 'primary';
            break;
        case 'outline-light':
            variantClasses =
                'bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-primary';
            spinnerVariant = 'white'; // White because text is white
            break;
        case 'solid-dark':
            variantClasses =
                'bg-brand-primary text-text-on-brand hover:bg-brand-primary/90';
            spinnerVariant = 'white';
            break;
        case 'neutral':
            variantClasses = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
            spinnerVariant = 'primary';
            break;
        case 'solid':
            variantClasses =
                'bg-brand-secondary text-text-on-brand hover:bg-brand-primary';
            spinnerVariant = 'white';
            break;
        case 'outline':
            variantClasses =
                'bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white';
            spinnerVariant = 'primary';
            break;
        case 'ghost':
            variantClasses =
                'bg-transparent text-gray-700 hover:bg-gray-100';
            spinnerVariant = 'primary';
            break;
        case 'destructive':
            variantClasses =
                'bg-red-500 text-white hover:bg-red-600';
            spinnerVariant = 'white';
            break;
    }

    const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

    const content = (
        <>
            {isLoading && (
                <Spinner size="sm" variant={spinnerVariant} className="mr-2" />
            )}
            {children}
        </>
    );

    if ('href' in props && props.href !== undefined) {
        const { href, ...rest } = props;
        // If loading, render as button disabled instead of link? Or just disable click.
        // Links don't have disabled attribute natively, but we can prevent default or pointer-events-none.
        // For simplicity, if loading, we might want to render as a disabled button or just apply styles.
        // But usually "isLoading" implies an action (button), not navigation.
        if (isLoading) {
            return (
                <button className={combinedClasses} disabled type="button">
                    {content}
                </button>
            );
        }

        return (
            <Link href={href} className={combinedClasses} {...rest}>
                {content}
            </Link>
        );
    }

    return (
        <button
            className={combinedClasses}
            disabled={isLoading || (props as ButtonAsButton).disabled}
            {...(props as ButtonAsButton)}
        >
            {content}
        </button>
    );
};

export default Button;