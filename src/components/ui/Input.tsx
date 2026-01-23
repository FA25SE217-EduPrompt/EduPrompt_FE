
import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, onFocus, onBlur, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
            block w-full px-4 py-3 border rounded-lg text-text-main placeholder-gray-400
            bg-white
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            transition-all duration-200
            ${isFocused ? "border-primary" : "border-gray-200 hover:border-gray-300"}
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
            ${className}
          `}
                    onFocus={(e) => {
                        setIsFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
