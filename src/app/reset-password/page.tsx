"use client";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { resetPassword } from "@/services/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { mapErrorToUserMessage, ErrorInput } from "@/utils/errorMapper";
import { useAuth } from "@/hooks/useAuth";
import { BaseResponse, ErrorPayload } from "@/types/api";

// Helper function to safely extract error message
function getErrorMessage(error: unknown): string {
  // First try the error mapper (cast to ErrorInput for compatibility)
  const mappedMessage = mapErrorToUserMessage(error as ErrorInput);
  if (mappedMessage) return mappedMessage;
  
  // Check if it's a standard Error object
  if (error instanceof Error) {
    return error.message;
  }
  
  // Check for axios-like error structure
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: BaseResponse<unknown> } }).response;
    if (response?.data?.error?.messages?.[0]) {
      return response.data.error.messages[0];
    }
  }
  
  return "Đặt lại mật khẩu thất bại";
}

/**
 * Response type for reset password API using standardized BaseResponse
 */
type ResetPasswordResponse = BaseResponse<{ message?: string }>;

function ResetPasswordForm() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [focusedId, setFocusedId] = useState<string | null>(null);

  //(prevents memory leaks)
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

  // Read token from query string on mount 
  const searchParams = useSearchParams();
  useEffect(() => {
    const queryToken = searchParams?.get("token");
    if (queryToken) {
      if (mountedRef.current) setToken(queryToken);
    } else {
      if (mountedRef.current)
        setErrorMessage("Invalid or missing reset token. Please request a new reset link.");
    }
  }, [searchParams]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!mountedRef.current) return;

      setErrorMessage("");
      setSuccessMessage("");

      if (!token) {
        setErrorMessage("Reset token is required. Please check your email link.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setErrorMessage("Mật khẩu không khớp!");
        return;
      }

      setSubmitting(true);
      try {
        const res = (await resetPassword({ token, newPassword })) as ResetPasswordResponse;

        // Follow the API envelope contract: `error` is null on success
        if (res?.error !== null) {
          const firstMessage =
            Array.isArray(res.error?.messages) && res.error!.messages!.length > 0
              ? res.error!.messages![0]
              : getErrorMessage(res.error) || "Đặt lại mật khẩu thất bại";
          if (!mountedRef.current) return;
          setErrorMessage(firstMessage);
          return;
        }

        const success = res?.data?.message || "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.";
        if (!mountedRef.current) return;
        setSuccessMessage(success);

        // preserve original 2000ms redirect timing
        setTimeout(() => {
          if (mountedRef.current) router.replace("/login");
        }, 2000);
      } catch (err: unknown) {
        if (!mountedRef.current) return;
        const errorMessage = getErrorMessage(err);
        setErrorMessage(errorMessage);
      } finally {
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [token, newPassword, confirmPassword, router]
  );

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
        <div
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Checking authentication"
        >
          <span className="sr-only">Checking authentication…</span>
        </div>
      </div>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <p className="sr-only">Redirecting…</p>;
  }

  return (
    <div className="min-h-screen gradient-bg from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
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
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Reset Password</h1>
          <p className="text-gray-600 text-lg">Enter your new password</p>
        </header>

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div className="group">
            <label
              htmlFor="newPassword"
              className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setFocusedId("newPassword")}
                onBlur={() => setFocusedId(null)}
                className={`block w-full px-6 py-4 pr-12 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 
                         bg-white/90 backdrop-blur-sm
                         focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white
                         transition-all duration-300 ease-out
                         hover:border-gray-300 hover:bg-white/95
                         ${focusedId === "newPassword" ? "transform scale-[1.02] shadow-lg shadow-blue-100/50" : ""}`}
                required
                placeholder="Enter new password"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={submitting}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </button>
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                            ${focusedId === "newPassword" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
                            transition-all duration-300 pointer-events-none`}
              ></div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="group">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedId("confirmPassword")}
                onBlur={() => setFocusedId(null)}
                className={`block w-full px-6 py-4 pr-12 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 
                         bg-white/90 backdrop-blur-sm
                         focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white
                         transition-all duration-300 ease-out
                         hover:border-gray-300 hover:bg-white/95
                         ${focusedId === "confirmPassword" ? "transform scale-[1.02] shadow-lg shadow-blue-100/50" : ""}`}
                required
                placeholder="Confirm new password"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                aria-pressed={showConfirmPassword}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                disabled={submitting}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </button>
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                            ${focusedId === "confirmPassword" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
                            transition-all duration-300 pointer-events-none`}
              ></div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-4 rounded-xl border border-green-200">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-4 rounded-xl border border-red-200 animate-pulse">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !token}
            className={`w-full text-white py-5 rounded-xl 
                     font-semibold text-lg shadow-lg hover:shadow-xl
                     transition-all duration-300 ease-out
                     transform hover:-translate-y-1 hover:scale-[1.02]
                     focus:outline-none focus:ring-4 focus:ring-blue-300/50
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                     active:scale-[0.98]
                     ${successMessage ? "bg-green-500 hover:bg-green-600" : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
            }`}
          >
            <span className="inline-flex items-center justify-center">
              {successMessage ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Password Reset!
                </>
              ) : submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </span>
          </button>
        </form>

        {/* Navigation Links */}
        <footer className="mt-8 text-center">
          <p className="text-gray-600">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
          <p className="text-gray-600 mt-2">
            Need a new reset link?{" "}
            <Link href="/forgot-password" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 hover:underline underline-offset-2">
              Request another
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
        <div
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Loading reset password form"
        >
          <span className="sr-only">Loading reset password form…</span>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
