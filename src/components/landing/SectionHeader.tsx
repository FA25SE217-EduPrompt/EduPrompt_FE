// src/components/landing/SectionHeader.tsx
import React from 'react';

interface SectionHeaderProps {
    title: string;
    subtitle: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
    return (
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4">
                {title}
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                {subtitle}
            </p>
        </div>
    );
};

export default SectionHeader;