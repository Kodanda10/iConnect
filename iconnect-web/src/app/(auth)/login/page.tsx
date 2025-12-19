/**
 * @file app/(auth)/login/page.tsx
 * @description Login page with email/password authentication
 * @changelog
 * - 2024-12-11: Initial implementation with Emerald/Amethyst theme
 * - 2024-12-11: Optimized for ultra-fast login with preloaded Firebase
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
// Preload Firebase modules at the top level for faster auth
import { getFirebaseAuth } from '@/lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

// Pre-initialize auth instance
const auth = getFirebaseAuth();

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Check if already logged in - skip login screen for faster UX
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Already logged in, redirect immediately
                router.replace('/settings');
            } else {
                setIsCheckingAuth(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        // Basic Validation
        if (!email.trim() || !password) {
            setLocalError("Email and Password are required");
            return;
        }

        setIsSubmitting(true);

        try {
            // Direct Firebase Auth with pre-initialized auth instance
            await signInWithEmailAndPassword(auth, email, password);
            // Navigate immediately after successful login
            router.replace('/settings');
        } catch (err: unknown) {
            let msg = 'Authentication failed';
            const firebaseErr = err as { code?: string };
            if (firebaseErr.code === 'auth/invalid-credential') {
                msg = 'Invalid email or password';
            } else if (firebaseErr.code === 'auth/user-not-found') {
                msg = 'User not found';
            } else if (firebaseErr.code === 'auth/wrong-password') {
                msg = 'Incorrect password';
            } else if (firebaseErr.code === 'auth/too-many-requests') {
                msg = 'Too many attempts. Try again later.';
            }
            setLocalError(msg);
            setIsSubmitting(false);
        }
    };

    // Show loading state while checking if already authenticated
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mx-auto" />
                    <p className="text-white/60 mt-2">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8 animate-fade-in">
                    <img
                        src="/app-logo-final.png"
                        alt="iConnect"
                        className="w-20 h-20 mx-auto mb-4 rounded-full shadow-lg"
                    />
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
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
                                    placeholder="admin@admin.com"
                                    autoComplete="email"
                                    className="glass-input-dark"
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
                                    autoComplete="current-password"
                                    className="glass-input-dark"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {localError && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm break-all">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{localError}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer Info */}
                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-white/40 text-xs">
                            Authorized personnel only via Raw Auth
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
