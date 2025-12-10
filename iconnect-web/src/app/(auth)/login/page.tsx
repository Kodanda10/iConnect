/**
 * @file app/(auth)/login/page.tsx
 * @description Login page with email/password authentication
 * @changelog
 * - 2024-12-11: Initial implementation with Emerald/Amethyst theme
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Database, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { signIn, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        if (!email.trim()) {
            setLocalError('Email is required');
            return;
        }

        if (!password) {
            setLocalError('Password is required');
            return;
        }

        try {
            await signIn(email, password);
            router.push('/');
        } catch (err) {
            // Error is handled by the auth context
        }
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg mb-4">
                        <Database className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        iConnect
                    </h1>
                    <p className="text-white/60 mt-2">
                        Constituent Relationship Management
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8 animate-slide-up">
                    <h2 className="text-xl font-bold text-white mb-6">
                        Sign in to your account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="staff@iconnect.local"
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {displayError && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{displayError}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-white/40 text-xs text-center">
                            Demo: staff@demo.com / leader@demo.com
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-white/30 text-xs mt-8">
                    © 2024 iConnect CRM. All rights reserved.
                </p>
            </div>
        </div>
    );
}
