'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loginAsAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both administrative email and password.');
      return;
    }

    try {
      setLoading(true);
      await loginAsAdmin(email.trim(), password);
      router.push('/admin');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify administrative credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@vantero.com');
    setPassword('Admin@123456');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-ink-900 text-paper flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-gold-500 selection:text-ink-900">
      {/* Top Header Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-ink-800">
        <Link href="/" className="inline-flex items-center text-xs tracking-widest text-ink-400 hover:text-gold-400 transition-colors uppercase">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Storefront
        </Link>
        <div className="flex items-center space-x-2 text-ink-400 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-gold-500" />
          <span>Internal Admin Portal</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="bg-ink-800/80 backdrop-blur border border-ink-700/80 rounded-sm p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Top Gold Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

          {/* Logo & Subtitle */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="font-serif text-3xl tracking-[0.2em] font-bold text-white uppercase">
              VANTERO
            </h1>
            <p className="text-[11px] tracking-[0.25em] text-gold-400/90 uppercase font-mono font-medium">
              Administrative Console
            </p>
            <p className="text-xs text-ink-400 pt-1">
              Sign in with your email and password to access store management
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-950/60 border border-rose-800/60 rounded-sm flex items-start space-x-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-300">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vantero.com"
                  autoComplete="email"
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-ink-900/90 border border-ink-700 rounded-sm text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-ink-900/90 border border-ink-700 rounded-sm text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-gold-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-400 hover:text-paper transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              isLoading={loading}
              className="w-full mt-2 font-medium tracking-wide flex items-center justify-center space-x-2"
            >
              <span>Authenticate Administrator</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-6 pt-5 border-t border-ink-700/60 flex flex-col items-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center space-x-1.5 text-[11px] text-ink-400 hover:text-gold-400 transition-colors py-1 px-2.5 rounded-sm hover:bg-ink-700/40"
            >
              <KeyRound className="w-3.5 h-3.5 text-gold-500/80" />
              <span>Fill Seed Admin Credentials</span>
            </button>
            <p className="text-[10px] text-ink-500 font-mono mt-2">
              admin@vantero.com &bull; Admin@123456
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-[11px] text-ink-500 text-center mt-6">
          Protected administrative system. Unauthorized access attempts are monitored and logged.
        </p>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center pt-6 border-t border-ink-800 text-xs text-ink-500">
        &copy; {new Date().getFullYear()} Vantero E-Commerce. All rights reserved.
      </div>
    </div>
  );
}
