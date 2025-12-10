/**
 * @file app/(dashboard)/scheduler/page.tsx
 * @description Scheduler page with calendar and task management
 * @changelog
 * - 2024-12-11: Initial implementation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
    ChevronLeft,
    ChevronRight,
    Gift,
    Heart,
    Phone,
    MessageSquare,
    Calendar,
    Filter,
    Loader2,
} from 'lucide-react';
import { EnrichedTask, TaskStatus, TaskType } from '@/types';

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

export default function SchedulerPage() {
    const { isStaff } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterStatus, setFilterStatus] = useState<TaskStatus>('PENDING');
    const [filterType, setFilterType] = useState<'ALL' | TaskType>('ALL');
    const [tasks, setTasks] = useState<EnrichedTask[]>([]);
    const [loading, setLoading] = useState(true);

    // Calendar helpers
    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Placeholder: In production, this would fetch from Firestore
    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setTasks([]);
            setLoading(false);
        }, 500);
    }, [selectedDate, filterStatus, filterType]);

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        return (
            day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear()
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    Scheduler
                </h1>
                <button className="btn-primary flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Add Festival
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 glass-card-light p-6 rounded-2xl">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={prevMonth}
                            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
                        </button>
                        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button
                            onClick={nextMonth}
                            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-semibold text-[var(--color-text-secondary)] py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for days before the first of the month */}
                        {Array.from({ length: firstDayOfMonth }, (_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {/* Day cells */}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            return (
                                <button
                                    key={day}
                                    onClick={() =>
                                        setSelectedDate(
                                            new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                                        )
                                    }
                                    className={`
                    aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all
                    ${isToday(day) ? 'ring-2 ring-[var(--color-primary)]' : ''}
                    ${isSelected(day)
                                            ? 'gradient-primary text-white shadow-lg'
                                            : 'hover:bg-black/5 text-[var(--color-text-primary)]'
                                        }
                  `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Task Sidebar */}
                <div className="glass-card-light p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-[var(--color-text-primary)]">
                            {selectedDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })}
                        </h3>
                        <button className="p-2 rounded-lg hover:bg-black/5">
                            <Filter className="w-4 h-4 text-[var(--color-text-secondary)]" />
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setFilterStatus('PENDING')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterStatus === 'PENDING'
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-black/5 text-[var(--color-text-secondary)]'
                                }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilterStatus('COMPLETED')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterStatus === 'COMPLETED'
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-black/5 text-[var(--color-text-secondary)]'
                                }`}
                        >
                            History
                        </button>
                    </div>

                    {/* Type Filters */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setFilterType('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterType === 'ALL'
                                    ? 'bg-[var(--color-secondary)] text-white'
                                    : 'bg-black/5 text-[var(--color-text-secondary)]'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterType('BIRTHDAY')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterType === 'BIRTHDAY'
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-black/5 text-[var(--color-text-secondary)]'
                                }`}
                        >
                            <Gift className="w-3 h-3" />
                            Birthdays
                        </button>
                        <button
                            onClick={() => setFilterType('ANNIVERSARY')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterType === 'ANNIVERSARY'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-black/5 text-[var(--color-text-secondary)]'
                                }`}
                        >
                            <Heart className="w-3 h-3" />
                            Anniversaries
                        </button>
                    </div>

                    {/* Task List */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-8">
                                <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin mx-auto" />
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="text-center py-8 text-[var(--color-text-secondary)]">
                                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No tasks for this date</p>
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-4 bg-black/5 rounded-xl hover:bg-black/10 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${task.type === 'BIRTHDAY' ? 'bg-pink-100 text-pink-500' : 'bg-purple-100 text-purple-500'
                                                }`}
                                        >
                                            {task.type === 'BIRTHDAY' ? (
                                                <Gift className="w-5 h-5" />
                                            ) : (
                                                <Heart className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--color-text-primary)]">
                                                {task.constituent.name}
                                            </p>
                                            <p className="text-xs text-[var(--color-text-secondary)]">
                                                Ward {task.constituent.ward_number}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            Call
                                        </button>
                                        <button className="flex-1 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            SMS
                                        </button>
                                        <button className="flex-1 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 text-xs font-bold flex items-center justify-center gap-1">
                                            <WhatsAppIcon className="w-3 h-3" />
                                            WhatsApp
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
