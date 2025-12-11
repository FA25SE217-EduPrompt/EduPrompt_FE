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
            <div className="min-h-screen gradient-bg flex items-center justify-center">
                <Spinner size="page" variant="white" />
            </div>
        );
    }

    // Redirect if already authenticated
    if (isAuthenticated) {
        return null;
    }

    return (
        <div
            className="min-h-screen gradient-bg from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
            <div
                className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden p-12 md:p-16 border border-white/30">
                {/* Header */}
                <header className="text-center mb-10">
                    <div className="inline-flex items-center justify-center mb-6">
                        <div
                            className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">E</span>
                        </div>
                        <span
                            className="ml-4 text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
                            EduPrompt
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-blue-800 mb-2">{t('createAccount')}</h1>
                    <p className="text-gray-600 text-lg">{t('joinSubtitle')}</p>
                </header>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields Row */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div className="group">
                            <label
                                htmlFor="firstName"
                                className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600"
                            >
                                {t('firstName')}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    onFocus={() => setFocusedId("firstName")}
                                    onBlur={() => setFocusedId(null)}
                                    className={`block w-full px-6 py-4 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 
                           bg-white/90 backdrop-blur-sm
                           focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white
                           transition-all duration-300 ease-out
                           hover:border-gray-300 hover:bg-white/95
                           ${focusedId === "firstName" ? "transform scale-[1.02] shadow-lg shadow-blue-100/50" : ""}`}
                                    required
                                    autoComplete="given-name"
                                    placeholder={t('firstNamePlaceholder')}
                                />
                                <div
                                    className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                              ${focusedId === "firstName" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
                              transition-all duration-300 pointer-events-none`}
                                ></div>
                            </div>
                        </div>

                        {/* Last Name */}
                        <div className="group">
                            <label
                                htmlFor="lastName"
                                className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600"
                            >
                                {t('lastName')}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    onFocus={() => setFocusedId("lastName")}
                                    onBlur={() => setFocusedId(null)}
                                    className={`block w-full px-6 py-4 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 
                           bg-white/90 backdrop-blur-sm
                           focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white
                           transition-all duration-300 ease-out
                           hover:border-gray-300 hover:bg-white/95
                           ${focusedId === "lastName" ? "transform scale-[1.02] shadow-lg shadow-blue-100/50" : ""}`}
                                    required
                                    autoComplete="family-name"
                                    placeholder={t('lastNamePlaceholder')}
                                />
                                <div
                                    className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                              ${focusedId === "lastName" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
                              transition-all duration-300 pointer-events-none`}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="group">
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600"
                        >
                            {t('emailLabel')}
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedId("email")}
                                onBlur={() => setFocusedId(null)}
                                className={`block w-full px-6 py-4 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 
                         bg-white/90 backdrop-blur-sm
                         focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white
                         transition-all duration-300 ease-out
                         hover:border-gray-300 hover:bg-white/95
                         ${focusedId === "email" ? "transform scale-[1.02] shadow-lg shadow-blue-100/50" : ""}`}
                                required
                                autoComplete="email"
                                placeholder={t('emailPlaceholder')}
                            />
                            <div
                                className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                            ${focusedId === "email" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
                            transition-all duration-300 pointer-events-none`}
                            ></div>
                        </div>
                    </div>

                    {/* Phone Number Field */}
                    <div className="group">
                        <label
                            htmlFor="phoneNumber"
                            className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600"
                        >
                            {t('phoneNumber')}
                        </label>
                        <div className="relative">
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                onFocus={() => setFocusedId("phoneNumber")}
                                onBlur={() => setFocusedId(null)}
                                className={`block w-full px-6 py-4 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 
                         bg-white/90 backdrop-blur-sm
                         focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white
                         transition-all duration-300 ease-out
                         hover:border-gray-300 hover:bg-white/95
                         ${focusedId === "phoneNumber" ? "transform scale-[1.02] shadow-lg shadow-blue-100/50" : ""}`}
                                required
                                autoComplete="tel"
                                placeholder={t('phoneNumberPlaceholder')}
                            />
                            <div
                                className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                            ${focusedId === "phoneNumber" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
                            transition-all duration-300 pointer-events-none`}
                            ></div>
                        </div>
                    </div>

                    {/* Password Fields Row */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Password */}
                        <div className="group">
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600"
                            >
                                {t('passwordLabel')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedId("password")}
                                    onBlur={() => setFocusedId(null)}
                                    className={`block w-full px-6 py-4 pr-12 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 
                           bg-white/90 backdrop-blur-sm
                           focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white
                           transition-all duration-300 ease-out
                           hover:border-gray-300 hover:bg-white/95
                           ${focusedId === "password" ? "transform scale-[1.02] shadow-lg shadow-blue-100/50" : ""}`}
                                    required
                                    autoComplete="new-password"
                                    placeholder={t('passwordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                                    title={showPassword ? t('hidePassword') : t('showPassword')}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    )}
                                </button>
                                <div
                                    className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                              ${focusedId === "password" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
                              transition-all duration-300 pointer-events-none`}
                                ></div>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="group">
                            <label
                                htmlFor="rePassword"
                                className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600"
                            >
                                {t('confirmPassword')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showRePassword ? "text" : "password"}
                                    id="rePassword"
                                    value={rePassword}
                                    onChange={(e) => setRePassword(e.target.value)}
                                    onFocus={() => setFocusedId("rePassword")}
                                    onBlur={() => setFocusedId(null)}
                                    className={`block w-full px-6 py-4 pr-12 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 
                           bg-white/90 backdrop-blur-sm
                           focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white
                           transition-all duration-300 ease-out
                           hover:border-gray-300 hover:bg-white/95
                           ${focusedId === "rePassword" ? "transform scale-[1.02] shadow-lg shadow-blue-100/50" : ""}`}
                                    required
                                    autoComplete="new-password"
                                    placeholder={t('confirmPasswordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    aria-label={showRePassword ? t('hidePassword') : t('showPassword')}
                                    title={showRePassword ? t('hidePassword') : t('showPassword')}
                                    onClick={() => setShowRePassword(!showRePassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {showRePassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    )}
                                </button>
                                <div
                                    className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                              ${focusedId === "rePassword" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
                              transition-all duration-300 pointer-events-none`}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div
                            className="text-green-600 text-sm text-center bg-green-50 p-4 rounded-xl border border-green-200">
                            {successMessage}
                        </div>
                    )}

                    {/* Error Message - Keep for form validation errors */}
                    {errorMessage && !showErrorPopup && (
                        <div
                            className="text-red-600 text-sm text-center bg-red-50 p-4 rounded-xl border border-red-200 animate-pulse">
                            {errorMessage}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full text-white py-5 rounded-xl 
                     font-semibold text-lg shadow-lg hover:shadow-xl
                     transition-all duration-300 ease-out
                     transform hover:-translate-y-1 hover:scale-[1.02]
                     focus:outline-none focus:ring-4 focus:ring-blue-300/50
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                     active:scale-[0.98]
                     ${successMessage ? "bg-green-500 hover:bg-green-600" : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"}`}
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
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
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
                <footer className="mt-8 text-center">
                    <p className="text-gray-600">
                        {t('alreadyHaveAccount')}{" "}
                        <Link
                            href="/login"
                            className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 hover:underline underline-offset-2"
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
