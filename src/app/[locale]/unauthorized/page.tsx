import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" role="main"
             aria-labelledby="unauth-title">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
                         aria-hidden="true">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                             aria-hidden="true" focusable="false">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                        </svg>
                    </div>
                </div>

                <h1 id="unauth-title" className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-6">
                    {"You don't have permission to access this page. Please contact an administrator if you believe this is an error."}
                </p>

                <div className="space-y-3">
                    <Link
                        href="/dashboard"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        href="/login"
                        className="block w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
