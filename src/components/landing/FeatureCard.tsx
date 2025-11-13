import React from 'react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
                                                     icon,
                                                     title,
                                                     description,
                                                 }) => {
    return (
        <div className="feature-card bg-bg-primary p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-brand-secondary rounded-lg flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-brand-primary mb-3">{title}</h3>
            <p className="text-text-secondary">{description}</p>
        </div>
    );
};

export default FeatureCard;