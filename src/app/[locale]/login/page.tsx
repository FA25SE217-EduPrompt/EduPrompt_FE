"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import ErrorPopup from "@/components/ui/ErrorPopup";
import { ErrorInput, getErrorType, mapErrorToUserMessage } from "@/utils/errorMapper";
import Spinner from "@/components/ui/Spinner";
import { useQueryClient } from "@tanstack/react-query";
import { promptKeys } from "@/hooks/queries/prompt";
import { promptsService } from '@/services/resources/prompts';
import { collectionKeys } from "@/hooks/queries/collection";
import { collectionService } from "@/services/resources/collection";
import { quotaKeys } from "@/hooks/queries/quota";
import { quotaService } from "@/services/resources/quota";

export default function LoginPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { login, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
    const t = useTranslations('Auth');

    // form state (kept as-is to preserve behavior)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [errorType, setErrorType] = useState<"error" | "warning" | "info">("error");
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [success, setSuccess] = useState(false);

    // small focus scale state to mimic the original input animation
    const [focusedId, setFocusedId] = useState<string | null>(null);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        try {
            const rememberEmail = localStorage.getItem("rememberEmail");
            if (rememberEmail) {
                setEmail(rememberEmail);
                setRemember(true);
            }
        } catch (e) {
            console.warn("Reading rememberEmail failed:", e);
        }
    }, []);

    // Google Identity Services - improved script loading and initialization
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    console.log('Google Client ID:', googleClientId); // Debug log
    const googleBtnRef = useRef<HTMLDivElement | null>(null);
    const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

    // handle Google credential (moved up to be available for initializeGoogleAuth)
    const handleGoogleCredential = useCallback(async (credential: string) => {
        // preserve original UI flow and timings
        if (!mountedRef.current) return;
        setErrorMessage("");
        setShowErrorPopup(false);
        setSubmitting(true);

        try {
            await loginWithGoogle(credential);

            if (!mountedRef.current) return;
            setSuccess(true);

            // PREFETCHING OPTIMIZATION
            // While the success animation plays (400-600ms), start fetching dashboard data
            try {
                // 1. My Prompts
                queryClient.prefetchQuery({
                    queryKey: [...promptKeys.all, 'my-prompt', { page: 0, size: 20 }],
                    queryFn: () => promptsService.getMyPrompts(0, 20),
                });
                // 2. Collections Count
                queryClient.prefetchQuery({
                    queryKey: collectionKeys.count(),
                    queryFn: () => collectionService.countMyCollections(),
                });
                // 3. User Quota
                queryClient.prefetchQuery({
                    queryKey: quotaKeys.all,
                    queryFn: () => quotaService.getUserQuota(),
                });
            } catch (prefetchErr) {
                console.warn("Prefetching failed", prefetchErr);
            }

            setTimeout(() => {
                // ensure navigation only when mounted
                if (mountedRef.current) router.replace("/");
            }, 400);
        } catch (err: unknown) {
            if (!mountedRef.current) return;
            const userFriendlyMessage = mapErrorToUserMessage(err as ErrorInput);
            setErrorMessage(userFriendlyMessage);
            setErrorType(getErrorType(err as ErrorInput));
            setShowErrorPopup(true);
        } finally {
            if (mountedRef.current) setSubmitting(false);
        }
    }, [router, loginWithGoogle]);

    // Initialize Google Identity Services
    const initializeGoogleAuth = useCallback(() => {
        if (!googleClientId || !googleScriptLoaded) return;

        try {
            // @ts-expect-error - Google Identity Services types not available
            window.google?.accounts?.id?.initialize({
                client_id: googleClientId,
                callback: (response: { credential?: string }) => {
                    const credential = response?.credential;
                    if (credential && mountedRef.current) {
                        handleGoogleCredential(credential);
                    }
                },
            });

            // Render the button
            const buttonElement = googleBtnRef.current || document.getElementById("googleSignInBtn");
            if (buttonElement) {
                // @ts-expect-error - Google Identity Services types not available
                window.google?.accounts?.id?.renderButton(buttonElement, {
                    theme: "outline",
                    size: "large",
                    width: 320
                });
            }
        } catch (e) {
            console.warn("Google Identity init error:", e);
        }
    }, [googleClientId, googleScriptLoaded, handleGoogleCredential]);

    // Load Google script
    useEffect(() => {
        if (!googleClientId) return;

        // Check if script is already loaded
        // @ts-expect-error - Google Identity Services types not available
        if (window.google?.accounts?.id) {
            setGoogleScriptLoaded(true);
            return;
        }

        // Check if script is already in DOM
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => setGoogleScriptLoaded(true));
            return;
        }

        // Create and load new script
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        const handleLoad = () => {
            setGoogleScriptLoaded(true);
        };

        script.addEventListener("load", handleLoad);
        document.head.appendChild(script);

        return () => {
            script.removeEventListener("load", handleLoad);
        };
    }, [googleClientId]);

    // Initialize Google Auth when script is loaded
    useEffect(() => {
        if (googleScriptLoaded && googleClientId) {
            initializeGoogleAuth();
        }
    }, [googleScriptLoaded, googleClientId, initializeGoogleAuth]);


    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/");
        }
    }, [isAuthenticated, router]);

    // handle submit (login)
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mountedRef.current) return;

        setErrorMessage("");
        setShowErrorPopup(false);
        setSubmitting(true);

        try {
            await login(email, password, remember);

            // success UI, then redirect (preserve 600ms)
            if (!mountedRef.current) return;
            setSuccess(true);

            // PREFETCHING OPTIMIZATION
            // While the success animation plays (400-600ms), start fetching dashboard data
            try {
                // 1. My Prompts
                queryClient.prefetchQuery({
                    queryKey: [...promptKeys.all, 'my-prompt', { page: 0, size: 20 }],
                    queryFn: () => promptsService.getMyPrompts(0, 20),
                });
                // 2. Collections Count
                queryClient.prefetchQuery({
                    queryKey: collectionKeys.count(),
                    queryFn: () => collectionService.countMyCollections(),
                });
                // 3. User Quota
                queryClient.prefetchQuery({
                    queryKey: quotaKeys.all,
                    queryFn: () => quotaService.getUserQuota(),
                });
            } catch (prefetchErr) {
                console.warn("Prefetching failed", prefetchErr);
            }

            setTimeout(() => {
                if (mountedRef.current) router.replace("/");
            }, 600);
        } catch (err: unknown) {
            if (!mountedRef.current) return;
            const userFriendlyMessage = mapErrorToUserMessage(err as ErrorInput);
            setErrorMessage(userFriendlyMessage);
            setErrorType(getErrorType(err as ErrorInput));
            setShowErrorPopup(true);
        } finally {
            if (mountedRef.current) setSubmitting(false);
        }
    }, [email, password, remember, router, login]);

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
                className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 relative z-10 transition-all duration-300">

                {/* Header */}
                <header className="text-center mb-10">
                    <div className="inline-flex items-center justify-center mb-6">
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
                    <h1 className="text-3xl font-bold text-text-main mb-2">{t('welcomeBack')}</h1>
                    <p className="text-text-muted">{t('signInSubtitle')}</p>
                </header>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="group">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-text-main mb-2 transition-colors"
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
                                className={`block w-full px-4 py-3 border rounded-lg text-text-main placeholder-gray-400 
                         bg-white
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                         transition-all duration-200
                         ${focusedId === "email" ? "border-primary" : "border-gray-200 hover:border-gray-300"}`}
                                required
                                placeholder={t('emailPlaceholder')}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="group">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-text-main mb-2 transition-colors"
                        >
                            {t('passwordLabel')}
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedId("password")}
                                onBlur={() => setFocusedId(null)}
                                className={`block w-full px-4 py-3 border rounded-lg text-text-main placeholder-gray-400 
                         bg-white
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                         transition-all duration-200
                         ${focusedId === "password" ? "border-primary" : "border-gray-200 hover:border-gray-300"}`}
                                required
                                placeholder={t('passwordPlaceholder')}
                            />
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-text-muted cursor-pointer group select-none">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2 transition-all"
                            />
                            <span className="text-sm group-hover:text-text-main transition-colors">
                                {t('rememberMe')}
                            </span>
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-primary font-medium hover:text-blue-700 transition-colors"
                        >
                            {t('forgotPassword')}
                        </Link>
                    </div>

                    {/* Error Message */}
                    {errorMessage && !showErrorPopup && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">
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
                     ${success
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-primary hover:bg-blue-700"
                            }`}
                    >
                        <span className="inline-flex items-center justify-center">
                            {success ? (
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
                                    {t('signingIn')}
                                </>
                            ) : (
                                t('signIn')
                            )}
                        </span>
                    </button>
                </form>

                {/* Social Login */}
                {googleClientId && (
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-text-muted">{t('orContinueWith')}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center">
                            {/* Use the ref to render google button */}
                            <div id="googleSignInBtn" ref={googleBtnRef}></div>
                        </div>
                    </div>
                )}

                {/* Sign Up Link */}
                <footer className="mt-8 text-center text-sm text-text-muted">
                    <p>
                        {t('noAccount')}{" "}
                        <Link
                            href="/register"
                            className="text-primary font-medium hover:text-blue-700 hover:underline transition-colors"
                        >
                            {t('createOne')}
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
