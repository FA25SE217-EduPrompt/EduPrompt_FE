"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ErrorPopup from "@/components/ui/ErrorPopup";
import { ErrorInput, getErrorType, mapErrorToUserMessage } from "@/utils/errorMapper";
import Spinner from "@/components/ui/Spinner";

export default function RegisterPage() {
    const router = useRouter();
    const { register, isAuthenticated, isLoading } = useAuth();
    const t = useTranslations('Auth');

    // form state (kept as-is to preserve behavior)
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [errorType, setErrorType] = useState<"error" | "warning" | "info">("error");
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>("");

    // Focus state for animations (unchanged behavior)
    const [focusedId, setFocusedId] = useState<string | null>(null);

    // Mounted guard to avoid setting state after unmount (prevents memory leaks)
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/");
        }
    }, [isAuthenticated, router]);

    // handle submit (extracted, typed, and stable identity)
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!mountedRef.current) return;

            setErrorMessage("");
            setShowErrorPopup(false);
            setSuccessMessage("");

            // client-side password match check (existing behavior)
            if (password !== rePassword) {
                setErrorMessage(t('passwordsDoNotMatch'));
                setErrorType("warning");
                setShowErrorPopup(true);
                return;
            }

            setSubmitting(true);
            try {
                await register({
                    email,
                    password,
                    firstName,
                    lastName,
                    phoneNumber,
                });

                // preserve original success message + routing behavior (1000ms)
                const message = t('registrationSuccess');
                if (!mountedRef.current) return;
                setSuccessMessage(message);

                setTimeout(() => {
                    if (mountedRef.current) router.replace("/verify-email");
                }, 1000);
            } catch (err: unknown) {
                if (!mountedRef.current) return;
                const userFriendlyMessage = mapErrorToUserMessage(err as ErrorInput);
                setErrorMessage(userFriendlyMessage);
                setErrorType(getErrorType(err as ErrorInput));
                setShowErrorPopup(true);
            } finally {
                if (mountedRef.current) setSubmitting(false);
            }
        },
        [email, password, rePassword, firstName, lastName, phoneNumber, router, register, t]
    );

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <Spinner size="page" variant="primary" />
            </div>
        );
    }

    // Redirect if already authenticated
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-surface relative flex items-center justify-center px-4 py-12 overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div
                className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 relative z-10">
                {/* Header */}
                <header className="text-center mb-10">
                    <div className="inline-flex items-center justify-center mb-6">
                        <Link href="/" className="inline-block group">
                            {/* Simple text logo or the image mock if they have one */}
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl shadow-sm">E</div>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-text-main mb-2">{t('createAccount')}</h1>
                    <p className="text-text-muted">{t('joinSubtitle')}</p>
                </header>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields Row */}
                    <div className="grid md:grid-cols-2 gap-5">
                        {/* First Name */}
                        <div className="group">
                            <label
                                htmlFor="firstName"
                                className="block text-sm font-medium text-text-main mb-2"
                            >
                                {t('firstName')}
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-text-main placeholder-gray-400 
                                     bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                required
                                autoComplete="given-name"
                                placeholder={t('firstNamePlaceholder')}
                            />
                        </div>

                        {/* Last Name */}
                        <div className="group">
                            <label
                                htmlFor="lastName"
                                className="block text-sm font-medium text-text-main mb-2"
                            >
                                {t('lastName')}
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-text-main placeholder-gray-400 
                                     bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                required
                                autoComplete="family-name"
                                placeholder={t('lastNamePlaceholder')}
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="group">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-text-main mb-2"
                        >
                            {t('emailLabel')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-text-main placeholder-gray-400 
                                 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            required
                            autoComplete="email"
                            placeholder={t('emailPlaceholder')}
                        />
                    </div>

                    {/* Phone Number Field */}
                    <div className="group">
                        <label
                            htmlFor="phoneNumber"
                            className="block text-sm font-medium text-text-main mb-2"
                        >
                            {t('phoneNumber')}
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-text-main placeholder-gray-400 
                                 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            required
                            autoComplete="tel"
                            placeholder={t('phoneNumberPlaceholder')}
                        />
                    </div>

                    {/* Password Fields Row */}
                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Password */}
                        <div className="group relative">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-text-main mb-2"
                            >
                                {t('passwordLabel')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg text-text-main placeholder-gray-400 
                                         bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    required
                                    autoComplete="new-password"
                                    placeholder={t('passwordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="group relative">
                            <label
                                htmlFor="rePassword"
                                className="block text-sm font-medium text-text-main mb-2"
                            >
                                {t('confirmPassword')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showRePassword ? "text" : "password"}
                                    id="rePassword"
                                    value={rePassword}
                                    onChange={(e) => setRePassword(e.target.value)}
                                    className="block w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg text-text-main placeholder-gray-400 
                                         bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    required
                                    autoComplete="new-password"
                                    placeholder={t('confirmPasswordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowRePassword(!showRePassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                >
                                    {showRePassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div
                            className="text-green-600 text-sm text-center bg-green-50 p-4 rounded-lg border border-green-200">
                            {successMessage}
                        </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && !showErrorPopup && (
                        <div
                            className="text-red-600 text-sm text-center bg-red-50 p-4 rounded-lg border border-red-200 animate-pulse">
                            {errorMessage}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full text-white py-3.5 rounded-lg 
                     font-medium text-base shadow-sm hover:shadow-md
                     transition-all duration-200
                     focus:outline-none focus:ring-4 focus:ring-primary/20
                     disabled:opacity-70 disabled:cursor-not-allowed
                     ${successMessage
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-primary hover:bg-blue-700"}`}
                    >
                        <span className="inline-flex items-center justify-center">
                            {successMessage ? (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    {t('success')}
                                </>
                            ) : submitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                                        fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('creatingAccount')}
                                </>
                            ) : (
                                t('createAccount')
                            )}
                        </span>
                    </button>
                </form>

                {/* Sign In Link */}
                <footer className="mt-8 text-center text-sm text-text-muted">
                    <p>
                        {t('alreadyHaveAccount')}{" "}
                        <Link
                            href="/login"
                            className="text-primary font-medium hover:text-blue-700 hover:underline transition-colors"
                        >
                            {t('signIn')}
                        </Link>
                    </p>
                </footer>
            </div>

            {/* Error Popup */}
            <ErrorPopup
                message={errorMessage}
                isVisible={showErrorPopup}
                onClose={() => setShowErrorPopup(false)}
                type={errorType}
                duration={6000}
            />
        </div>
    );
}
