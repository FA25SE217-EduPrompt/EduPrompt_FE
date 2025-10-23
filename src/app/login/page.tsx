"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorPopup from "@/components/ui/ErrorPopup";
import { mapErrorToUserMessage, getErrorType } from "@/utils/errorMapper";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isAuthenticated, isLoading } = useAuth();

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
      // eslint-disable-next-line no-console
      console.warn("Reading rememberEmail failed:", e);
    }
  }, []);

  // Google Identity Services - improved script loading and initialization
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
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
      setTimeout(() => {
        // ensure navigation only when mounted
        if (mountedRef.current) router.replace("/");
      }, 400);
    } catch (err: any) {
      if (!mountedRef.current) return;
      const userFriendlyMessage = mapErrorToUserMessage(err);
      setErrorMessage(userFriendlyMessage);
      setErrorType(getErrorType(err));
      setShowErrorPopup(true);
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }, [router, loginWithGoogle]);

  // Initialize Google Identity Services
  const initializeGoogleAuth = useCallback(() => {
    if (!googleClientId || !googleScriptLoaded) return;
    
    try {
      // @ts-ignore
      window.google?.accounts?.id?.initialize({
        client_id: googleClientId,
        callback: (response: any) => {
          const credential = response?.credential;
          if (credential && mountedRef.current) {
            handleGoogleCredential(credential);
          }
        },
      });
      
      // Render the button
      const buttonElement = googleBtnRef.current || document.getElementById("googleSignInBtn");
      if (buttonElement) {
        // @ts-ignore
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
    // @ts-ignore
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
      setTimeout(() => {
        if (mountedRef.current) router.replace("/");
      }, 600);
    } catch (err: any) {
      if (!mountedRef.current) return;
      const userFriendlyMessage = mapErrorToUserMessage(err);
      setErrorMessage(userFriendlyMessage);
      setErrorType(getErrorType(err));
      setShowErrorPopup(true);
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }, [email, password, remember, router, login]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden p-12 md:p-16 border border-white/30">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <span className="ml-4 text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
              EduPrompt
            </span>
          </div>
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-lg">Sign in to your account to continue</p>
        </header>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email Field */}
          <div className="group">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedId("email")}
                onBlur={() => setFocusedId(null)}
                className={`block w-full px-6 py-5 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 
                         bg-white/90 backdrop-blur-sm
                         focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white
                         transition-all duration-300 ease-out
                         hover:border-gray-300 hover:bg-white/95
                         ${focusedId === "email" ? "transform scale-[1.02] shadow-lg shadow-blue-100/50" : ""}`}
                required
                placeholder="Enter your email address"
              />
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                            ${focusedId === "email" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
                            transition-all duration-300 pointer-events-none`}
              ></div>
            </div>
          </div>

          {/* Password Field */}
          <div className="group">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600"
            >
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedId("password")}
                onBlur={() => setFocusedId(null)}
                className={`block w-full px-6 py-5 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 
                         bg-white/90 backdrop-blur-sm
                         focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white
                         transition-all duration-300 ease-out
                         hover:border-gray-300 hover:bg-white/95
                         ${focusedId === "password" ? "transform scale-[1.02] shadow-lg shadow-blue-100/50" : ""}`}
                required
                placeholder="Enter your password"
              />
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                            ${focusedId === "password" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
                            transition-all duration-300 pointer-events-none`}
              ></div>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 text-gray-600 cursor-pointer group">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 
                         transition-all duration-200 group-hover:border-blue-400"
              />
              <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 
                       hover:underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error Message - Keep for form validation errors */}
          {errorMessage && !showErrorPopup && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-4 rounded-xl border border-red-200 
                          animate-pulse">
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
                     ${success
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
              }`}
          >
            <span className="inline-flex items-center justify-center">
              {success ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Success!
                </>
              ) : submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in.
                </>
              ) : (
                "Sign In"
              )}
            </span>
          </button>
        </form>

        {/* Social Login */}
        {googleClientId && (
          <div className="mt-6">
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-grow h-px bg-gray-200" />
                <span className="mx-3 text-gray-400 text-sm">or continue with</span>
                <div className="flex-grow h-px bg-gray-200" />
              </div>
              <div className="mt-4 flex justify-center">
                {/* Use the ref to render google button */}
                <div id="googleSignInBtn" ref={googleBtnRef}></div>
              </div>
            </div>
          </div>
        )}

        {/* Sign Up Link */}
        <footer className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 
                       hover:underline underline-offset-2"
            >
              Create one
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
