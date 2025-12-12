/**
 * @file components/ui/GlassCalendar.tsx
 * @description Reusable Glassmorphism Calendar Component
 */
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GlassCalendarProps {
    selectedDate?: Date;
    onSelect: (date: Date) => void;
    eventDates?: string[]; // Array of YYYY-MM-DD
    className?: string;
}

export default function GlassCalendar({ selectedDate = new Date(), onSelect, eventDates = [], className = '' }: GlassCalendarProps) {
    const [viewDate, setViewDate] = useState(selectedDate);

    // Update view if selectedDate changes externally
    useEffect(() => {
        if (selectedDate) setViewDate(selectedDate);
    }, [selectedDate]);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
    };

    const isSelected = (day: number) => {
        return day === selectedDate.getDate() && viewDate.getMonth() === selectedDate.getMonth() && viewDate.getFullYear() === selectedDate.getFullYear();
    };

    const formatDateKey = (day: number) => {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className={`glass-card-light p-4 rounded-xl ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <button onClick={(e) => { e.preventDefault(); prevMonth(); }} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-sm font-bold text-white">
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </h2>
                <button onClick={(e) => { e.preventDefault(); nextMonth(); }} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-7 border-b border-white/5 mb-1">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-[10px] font-semibold text-white/40 py-2 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 border-l border-white/5 relative bg-black/20 rounded-lg overflow-hidden">
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                    <div key={`empty-${i}`} className="aspect-square border-r border-b border-white/5" />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                    const isSelectedDay = isSelected(day);
                    const isTodayDay = isToday(day);
                    const dateKey = formatDateKey(day);
                    const hasEvent = eventDates.includes(dateKey);

                    return (
                        <button
                            key={day}
                            onClick={(e) => { e.preventDefault(); onSelect(date); }}
                            className={`
                                aspect-square flex items-center justify-center text-xs font-medium transition-all relative
                                border-r border-b border-white/5
                                ${isSelectedDay ? 'bg-emerald-500/20 text-emerald-400 z-10' : 'text-white/80 hover:bg-white/5 hover:text-white'}
                            `}
                        >
                            {isTodayDay && <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-emerald-400"></span>}
                            {hasEvent && !isSelectedDay && !isTodayDay && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white/30"></span>}

                            <span className={`w-6 h-6 flex items-center justify-center rounded-lg ${isSelectedDay ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : ''}`}>
                                {day}
                            </span>
                        </button>
                    );
                })}
                {/* Fill remaining grid cells */}
                {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }, (_, i) => (
                    <div key={`fill-${i}`} className="aspect-square border-r border-b border-white/5" />
                ))}
            </div>
        </div>
    );
}
