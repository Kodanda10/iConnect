/**
 * @file app/(dashboard)/layout.tsx
 * @description Protected dashboard layout with role-based access
 * @changelog
 * - 2024-12-11: Initial implementation with auth protection
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Database, Loader2, LogOut, Calendar, Upload, Bell, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, loading, signOut, isStaff } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!user) {
        return null;
    }

    const navItems = [
        { href: '/settings', label: 'Dashboard', icon: Database, staffOnly: false },
        { href: '/upload', label: 'Data Entry', icon: Upload, staffOnly: true },
        { href: '/scheduler', label: 'Scheduler', icon: Calendar, staffOnly: false },
        { href: '/meeting', label: 'Meeting', icon: Users, staffOnly: false },
    ];

    const filteredNavItems = navItems.filter(item => !item.staffOnly || isStaff);

    return (
        <div className="min-h-screen">
            {/* VisionOS Floating Glass Header */}
            <header className="sticky top-0 z-50 py-3 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-navbar flex items-center justify-between h-14 px-4 sm:px-6">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <img
                                src="/app-logo-final.png"
                                alt="iConnect"
                                className="w-9 h-9 rounded-full shadow-lg object-cover"
                            />
                            <div className="hidden sm:block">
                                <span className="text-xl font-bold text-white tracking-tight leading-none block">
                                    iConnect
                                </span>
                                <p className="text-[10px] text-white/50 -mt-0.5">
                                    Staff Portal
                                </p>
                            </div>
                        </div>

                        {/* Navigation - Animated Glass Pills */}
                        <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm p-1.5 rounded-full">
                            {filteredNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`glass-navbar-link ${isActive ? 'active' : ''}`}
                                        onMouseMove={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const x = ((e.clientX - rect.left) / rect.width) * 100;
                                            const y = ((e.clientY - rect.top) / rect.height) * 100;
                                            e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                                            e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                                        }}
                                    >
                                        <item.icon className="w-4 h-4 nav-icon" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right Section */}
                        <div className="flex items-center gap-2">
                            {/* Notification Bell */}
                            <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                                <Bell className="w-5 h-5 text-white/70" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[rgba(30,45,40,0.8)]" />
                            </button>

                            {/* User Info */}
                            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/20">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-white">
                                        {user.name || user.email?.split('@')[0]}
                                    </p>
                                    <p className="text-[10px] text-white/50 uppercase tracking-wider">
                                        {user.role}
                                    </p>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card-light border-t border-black/10 pb-safe z-50">
                <div className="flex justify-around py-2">
                    {filteredNavItems.slice(0, 4).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors
                  ${isActive
                                        ? 'text-[var(--color-primary)]'
                                        : 'text-[var(--color-text-secondary)]'
                                    }
                `}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
