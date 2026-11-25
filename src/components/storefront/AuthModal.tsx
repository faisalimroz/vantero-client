'use client';

import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { X, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, pendingRedirect } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    setLoading(true);
    try {
      if (credentialResponse.credential) {
        await signInWithGoogle(credentialResponse.credential);
        if (pendingRedirect) {
          router.push(pendingRedirect);
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Google authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="relative w-full max-w-md bg-paper border border-line rounded-md shadow-2xl p-7 text-center overflow-hidden">
        {/* Subtle decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 text-ink-500 hover:text-ink-900 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="mb-6 space-y-1.5 pt-1">
          <p className="text-xs uppercase tracking-overline text-gold-500 font-medium">
            Vantero Identification
          </p>
          <h2 className="text-2xl font-serif font-medium text-ink-900 tracking-tight">
            Access Your Account
          </h2>
          <p className="text-xs text-ink-600 max-w-xs mx-auto leading-relaxed">
            Sign in with Google for seamless Cash on Delivery ordering, live order tracking, and 7-day doorstep return concierge.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm text-left">
            {error}
          </div>
        )}

        {/* Google Authentication Section */}
        <div className="py-2 space-y-5 flex flex-col items-center">
          <div className="w-full flex justify-center">
            {loading ? (
              <div className="py-3 flex items-center gap-2 text-xs text-ink-600 font-medium">
                <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                <span>Authenticating with Google...</span>
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in was canceled or encountered an issue. Please try again.')}
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  text="continue_with"
                  width="320"
                />
              </div>
            )}
          </div>

          {/* Member Benefits Reassurance */}
          <div className="w-full bg-stone/40 border border-line rounded-sm p-3.5 text-left space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              Member Privileges Included:
            </p>
            <ul className="text-xs text-ink-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% Cash on Delivery nationwide across 64 districts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant dispatch notifications & live timeline</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Complimentary 7-day post-delivery doorstep exchanges</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-line text-[11px] text-ink-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
          <span>Strictly Cash on Delivery · Your cart is automatically saved</span>
        </div>
      </div>
    </div>
  );
};
