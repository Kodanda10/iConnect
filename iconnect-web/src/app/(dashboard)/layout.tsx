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
import { Database, Loader2, LogOut, Calendar, Upload, Settings, Bell, PartyPopper } from 'lucide-react';
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
        { href: '/', label: 'Dashboard', icon: Database, staffOnly: false },
        { href: '/scheduler', label: 'Scheduler', icon: Calendar, staffOnly: false },
        { href: '/festivals', label: 'Festivals', icon: PartyPopper, staffOnly: true },
        { href: '/upload', label: 'Data Entry', icon: Upload, staffOnly: true },
        { href: '/settings', label: 'Settings', icon: Settings, staffOnly: true },
    ];

    const filteredNavItems = navItems.filter(item => !item.staffOnly || isStaff);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="glass-card-light border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                                <Database className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-[var(--color-text-primary)]">
                                    iConnect
                                </h1>
                                <p className="text-xs text-[var(--color-text-secondary)] -mt-0.5">
                                    Staff Portal
                                </p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-1 bg-black/5 p-1 rounded-xl">
                            {filteredNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive
                                                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5'
                                            }
                    `}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            {/* Notification Bell */}
                            <button className="relative p-2 rounded-full hover:bg-black/5 transition-colors">
                                <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>

                            {/* User Info */}
                            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-black/10">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                        {user.name || user.email}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        {user.role}
                                    </p>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 rounded-lg hover:bg-red-50 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
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
