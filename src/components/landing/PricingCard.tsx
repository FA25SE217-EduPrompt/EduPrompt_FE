import React from 'react';
import Button, {ButtonProps} from '@/components/ui/Button';

interface PricingCardProps {
    title: string;
    price: string;
    pricePer: string;
    features: string[];
    buttonProps: ButtonProps;
    popular?: boolean;
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

const PricingCard: React.FC<PricingCardProps> = ({
                                                     title,
                                                     price,
                                                     pricePer,
                                                     features,
                                                     buttonProps,
                                                     popular = false,
                                                 }) => {
    const cardClasses = popular
        ? 'bg-bg-primary border-2 border-brand-secondary p-8 rounded-xl relative'
        : 'bg-bg-secondary p-8 rounded-xl';

    return (
        <div className={cardClasses}>
            {popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-brand-secondary text-text-on-brand px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
                </div>
            )}
            <h3 className="text-2xl font-bold text-brand-primary mb-4">{title}</h3>
            <div className="text-4xl font-bold text-brand-primary mb-6">
                {price}
                <span className="text-lg text-text-secondary">{pricePer}</span>
            </div>
            <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-text-secondary">
                        <CheckIcon/>
                        {feature}
                    </li>
                ))}
            </ul>
            <Button
                className="w-full !text-base !py-3"
                {...buttonProps}
            />
        </div>
    );
};

export default PricingCard;