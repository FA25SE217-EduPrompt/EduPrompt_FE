import React from 'react';
import Button, { ButtonProps } from '@/components/ui/Button';

interface PricingCardProps {
    title: string;
    price: string;
    pricePer: string;
    features: string[];
    buttonProps: ButtonProps;
    popular?: boolean;
    details?: React.ReactNode;
}

const CheckIcon = () => (
    <svg
        className="w-5 h-5 text-brand-secondary mr-3 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
    >
        <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
        ></path>
    </svg>
);

const PricingCard: React.FC<PricingCardProps> = ({ title, price, pricePer, features, buttonProps, popular, details }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div className={`bg-white rounded-xl shadow-sm border ${popular ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-gray-200'} p-6 flex flex-col h-full relative transition-all duration-300 hover:shadow-md`}>
            {popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold text-gray-900">{price}</span>
                {pricePer && <span className="text-gray-500 text-sm ml-1">{pricePer}</span>}
            </div>

            <ul className="space-y-3 mb-6 flex-1">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-auto space-y-3">
                <Button className="w-full" {...buttonProps} />
                {details && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full text-xs text-center text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1 transition-colors"
                    >
                        {isExpanded ? "Show Less" : "View Plan Details"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Expandable Details Section */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-4 border-t pt-4' : 'max-h-0 opacity-0'}`}>
                {details}
            </div>
        </div>
    );
};

export default PricingCard;