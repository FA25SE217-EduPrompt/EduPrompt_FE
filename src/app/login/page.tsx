"use client";

import { useEffect, useState } from "react";
import { loginUser, loginWithGoogle } from "@/services/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const rememberEmail = localStorage.getItem("rememberEmail");
      if (rememberEmail) {
        setEmail(rememberEmail);
        setRemember(true);
      }
    } catch {}
  }, []);

  // Google Identity Services
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  useEffect(() => {
    if (!googleClientId) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      try {
        // @ts-ignore
        window.google?.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            const credential = response?.credential;
            if (credential) {
              handleGoogleCredential(credential);
            }
          },
        });
        // @ts-ignore
        window.google?.accounts.id.renderButton(
          document.getElementById('googleSignInBtn'),
          { theme: 'outline', size: 'large', width: 320 }
        );
      } catch {}
    };
    return () => {
      document.body.removeChild(script);
    };
  }, [googleClientId]);

  const handleGoogleCredential = async (credential: string) => {
    setErrorMessage("");
    setSubmitting(true);
    try {
      const res = await loginWithGoogle({ tokenId: credential });
      if (res?.error) {
        const firstMessage = Array.isArray(res.error.messages) && res.error.messages.length > 0
          ? res.error.messages[0]
          : "Google đăng nhập thất bại";
        setErrorMessage(firstMessage);
        return;
      }
      const token = res?.data?.token;
      if (!token) {
        setErrorMessage("Phản hồi không hợp lệ từ máy chủ");
        return;
      }
      try {
        localStorage.setItem("token", token);
      } catch {}
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 400);
    } catch (err: any) {
      const fallback = err?.response?.data?.error?.messages?.[0] || err?.message || "Google đăng nhập thất bại";
      setErrorMessage(fallback);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const res = await loginUser({ email, password });

      if (res?.error) {
        const firstMessage =
          Array.isArray(res.error.messages) && res.error.messages.length > 0
            ? res.error.messages[0]
            : "Đăng nhập thất bại";
        setErrorMessage(firstMessage);
        return;
      }

      const token = res?.data?.token;
      if (!token) {
        setErrorMessage("Phản hồi không hợp lệ từ máy chủ");
        return;
      }

      try {
        localStorage.setItem("token", token);
        if (remember) {
          localStorage.setItem("rememberEmail", email);
        } else {
          localStorage.removeItem("rememberEmail");
        }
      } catch {}

      // success UI, then redirect
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 600);
    } catch (err: any) {
      const fallback =
        err?.response?.data?.error?.messages?.[0] || err?.message || "Đăng nhập thất bại";
      setErrorMessage(fallback);
    } finally {
      setSubmitting(false);
    }
  };

  // small focus scale state to mimic the original input animation
  const [focusedId, setFocusedId] = useState<string | null>(null);

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
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                            ${focusedId === "email" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
                            transition-all duration-300 pointer-events-none`}></div>
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
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 
                            ${focusedId === "password" ? "from-blue-400/10 via-blue-400/5 to-blue-400/10" : ""} 
                            transition-all duration-300 pointer-events-none`}></div>
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

          {/* Error Message */}
          {errorMessage && (
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
                  Signing in...
                </>
              ) : (
                'Sign In'
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
                 <div id="googleSignInBtn"></div>
               </div>
             </div>
           </div>
         )}

         {/* Sign Up Link */}
        <footer className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
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
    </div>
  );
}