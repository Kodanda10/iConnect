/**
 * @file app/(dashboard)/page.tsx
 * @description Main dashboard page (CMS & Admin)
 * @changelog
 * - 2024-12-11: Initial implementation
 */

'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Activity, Users, Calendar, CheckCircle, TrendingUp, Clock } from 'lucide-react';

export default function DashboardPage() {
    const { user, isStaff } = useAuth();

    // Placeholder stats - will be replaced with real Firestore data
    const stats = [
        { label: 'Total Constituents', value: '1,234', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Pending Tasks', value: '45', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Completed Today', value: '12', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'This Month', value: '156', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Banner */}
            <div className="glass-card-light p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                            Welcome back, {user?.name || 'User'}!
                        </h1>
                        <p className="text-[var(--color-text-secondary)] mt-1">
                            Here&apos;s what&apos;s happening with your constituents today.
                        </p>
                    </div>
                    {isStaff && (
                        <button className="btn-primary flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Run Daily Scan
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="glass-card-light p-5 rounded-xl animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
                                <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Today's Tasks */}
                <div className="lg:col-span-2 glass-card-light p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                            Today&apos;s Tasks
                        </h2>
                        <button className="text-sm text-[var(--color-primary)] font-medium hover:underline">
                            View All
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Placeholder task items */}
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 bg-black/5 rounded-xl hover:bg-black/10 transition-colors cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-pink-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Sample Constituent {i}
                                    </p>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        Birthday • Ward 12
                                    </p>
                                </div>
                                <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                                    PENDING
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-card-light p-6 rounded-2xl">
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
                        Quick Actions
                    </h2>

                    <div className="space-y-3">
                        <button className="w-full btn-primary text-left flex items-center gap-3">
                            <Users className="w-5 h-5" />
                            Add Constituent
                        </button>
                        <button className="w-full btn-secondary text-left flex items-center gap-3">
                            <Calendar className="w-5 h-5" />
                            Schedule Campaign
                        </button>
                        <button className="w-full p-4 rounded-xl border-2 border-dashed border-black/20 text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-3">
                            <Activity className="w-5 h-5" />
                            View Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
