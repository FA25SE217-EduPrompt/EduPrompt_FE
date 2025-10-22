"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const { verifyEmail, resendVerification, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending');
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const mountedRef = useRef(true);
  const verifiedForTokenRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
        if (isLoading) return;
        // Redirect if already authenticated
        if (isAuthenticated) {
          router.replace("/");
          return;
        }
        const token = searchParams.get('token');
        if (token) {
          if (verifiedForTokenRef.current === token) return;
          verifiedForTokenRef.current = token;
          handleVerification(token);
        } else {
          if (mountedRef.current) {
            setVerificationStatus('error');
            setMessage('Invalid verification link. Please check your email and try again.');
          }
          setMessage('Invalid verification link. Please check your email and try again.');
        }
      }, [searchParams, isAuthenticated, isLoading, router]);

  const handleVerification = async (token: string) => {
    if (!mountedRef.current) return;
    
    setIsVerifying(true);
    setVerificationStatus('pending');

    try {
      await verifyEmail(token);
      
      if (mountedRef.current) {
        setVerificationStatus('success');
        setMessage('Email verified successfully! You can now log in to your account.');
        setTimeout(() => {
          if (mountedRef.current) router.replace("/login");
        }, 1000);
      }
    } catch (error: any) {
      if (mountedRef.current) {
        setVerificationStatus('error');
        setMessage(error.message || 'Verification failed. Please try again.');
        setTimeout(() => {
          if (mountedRef.current) router.replace("/login");
        }, 1000);
      }
    } finally {
      if (mountedRef.current) {
        setIsVerifying(false);
      }
    }
  };

  const handleResendVerification = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      if (mountedRef.current) {
        setMessage('Please enter your email address.');
      }
     return;
   }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    if (mountedRef.current) {
      setMessage('Please enter a valid email address.');
    }
    return;
  }

    if (!mountedRef.current) return;
    
    setIsResending(true);
    if (mountedRef.current) {
      setMessage("");
    }

    try {
      await resendVerification(email);
      
      if (mountedRef.current) {
        setMessage('Verification email sent! Please check your inbox.');
      }
    } catch (error: any) {
      if (mountedRef.current) {
        setMessage(error.message || 'Failed to resend verification email.');
      }
    } finally {
      if (mountedRef.current) {
        setIsResending(false);
      }
    }
  };

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
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Email Verification</h1>
          <p className="text-gray-600 text-lg">
            {verificationStatus === 'pending' && 'Verifying your email...'}
            {verificationStatus === 'success' && 'Email verified successfully!'}
            {verificationStatus === 'error' && 'Verification failed'}
          </p>
        </header>

        {/* Content */}
        <div className="space-y-6">
          {/* Loading State */}
          {isVerifying && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying your email address...</p>
            </div>
          )}

          {/* Success State */}
          {verificationStatus === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-green-600 text-lg font-semibold mb-4">{message}</p>
              <Link
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Go to Login
              </Link>
            </div>
          )}

          {/* Error State */}
          {verificationStatus === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="text-red-600 text-lg font-semibold mb-4">{message}</p>
              
              {/* Resend Verification Form */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter your email to resend verification
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    disabled={isResending}
                  />
                </div>
                
                <button
                  onClick={handleResendVerification}
                  disabled={isResending || !email.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && verificationStatus !== 'success' && (
            <div className={`text-center p-4 rounded-lg ${
              verificationStatus === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {message}
            </div>
          )}

          {/* Navigation Links */}
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Already verified?{" "}
              <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                Sign in
              </Link>
            </p>
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
