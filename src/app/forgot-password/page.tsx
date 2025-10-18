"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { forgotPassword } from "@/services/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mapErrorToUserMessage, getErrorType } from "@/utils/errorMapper";


type ApiForgotResponse = {
  data: { message?: string } | null;
  error: { code?: string; messages?: string[]; status?: string } | null;
};

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [focusedId, setFocusedId] = useState<string | null>(null);

  // (prevents memory leaks)
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!mountedRef.current) return;

      setErrorMessage("");
      setSuccessMessage("");
      setSubmitting(true);

      try {
        const res = (await forgotPassword({ email })) as ApiForgotResponse;

        // Explicitly check for `error !== null` per API envelope contract
        if (res?.error !== null) {
          const firstMessage =
            Array.isArray(res.error?.messages) && res.error!.messages!.length > 0
              ? res.error!.messages![0]
              : mapErrorToUserMessage(res.error) || "Có lỗi xảy ra khi gửi email";
          if (!mountedRef.current) return;
          setErrorMessage(firstMessage);
          return;
        }

        // Success path: use message from data or fallback copy
        const success = res?.data?.message || "Vui lòng kiểm tra email để đặt lại mật khẩu!";
        if (!mountedRef.current) return;
        setSuccessMessage(success);
      } catch (err: any) {
        if (!mountedRef.current) return;
        // Prefer mapErrorToUserMessage (handles many shapes), fallback to sensible strings
        const fallback =
          mapErrorToUserMessage(err) ||
          err?.response?.data?.error?.messages?.[0] ||
          err?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại.";
        setErrorMessage(fallback);
      } finally {
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [email]
  );

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
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Forgot Password?</h1>
          <p className="text-gray-600 text-lg">Enter your email to receive reset email</p>
        </header>

        {/* Forgot Password Form */}
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
                className={`block w-full px-6 py-4 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 
                         bg-white/90 backdrop-blur-sm
                         focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white
                         transition-all duration-300 ease-out
                         hover:border-gray-300 hover:bg-white/95
                         ${focusedId === "email" ? "transform scale-[1.02] shadow-lg shadow-blue-100/50" : ""}`}
                required
                placeholder="Enter your email address"
                disabled={submitting}
              />
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                            ${focusedId === "email" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
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
            <div
              className="text-red-600 text-sm text-center bg-red-50 p-4 rounded-xl border border-red-200 
                          animate-pulse"
            >
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
                     ${successMessage ? "bg-green-500 hover:bg-green-600" : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
            }`}
          >
            <span className="inline-flex items-center justify-center">
              {successMessage ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Email Sent!
                </>
              ) : submitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </span>
          </button>
        </form>

        {/* Navigation Links */}
        <footer className="mt-8 text-center">
          <p className="text-gray-600">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
          <p className="text-gray-600 mt-2">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 hover:underline underline-offset-2"
            >
              Create one
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
