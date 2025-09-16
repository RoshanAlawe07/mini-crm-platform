"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Signing you in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const success = params.get("success");

        if (success === 'true') {
          // Cookie-based authentication - no need to handle token manually
          setStatus('success');
          setMessage('Successfully signed in! Redirecting to dashboard...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          // Check if there's an error parameter
          const error = params.get("error");
          if (error) {
            setStatus('error');
            setMessage(`Authentication failed: ${error}`);
            setTimeout(() => {
              router.push("/signin");
            }, 3000);
          } else {
            setStatus('error');
            setMessage('Authentication failed. Redirecting to sign in...');
            setTimeout(() => {
              router.push("/signin");
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('An error occurred. Redirecting to sign in...');
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
