
'use client';

import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

export default function ContactSalesPage() {
    const t = useTranslations('ContactSales');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        schoolName: '',
        address: '',
        fullName: '',
        position: '',
        email: '',
        details: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        toast.success(t('successMessage'));
        setFormData({
            schoolName: '',
            address: '',
            fullName: '',
            position: '',
            email: '',
            details: ''
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between">
                    <Link href="/dashboard/subscription" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                </div>

                <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-4">
                        <Link href="/" className="inline-block group">
                            <Image
                                src="/logo.png"
                                alt="EduPrompt Logo"
                                width={56}
                                height={56}
                                className="w-14 h-14 rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-300"
                            />
                        </Link>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {t('title')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {t('subtitle')}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            label={t('schoolName')}
                            name="schoolName"
                            required
                            value={formData.schoolName}
                            onChange={handleChange}
                        />

                        <Input
                            label={t('address')}
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label={t('fullName')}
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                            />

                            <Input
                                label={t('position')}
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                            />
                        </div>

                        <Input
                            label={t('email')}
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />

                        <Textarea
                            label={t('details')}
                            name="details"
                            rows={4}
                            value={formData.details}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            variant="solid-dark"
                            className="w-full justify-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '...' : <>{t('submit')} <Send className="ml-2 w-4 h-4" /></>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
