/**
 * @file components/ui/GlassCalendar.tsx
 * @description Reusable Glassmorphism Calendar Component with full date navigation
 * @changelog
 * - 2024-12-11: Initial implementation
 * - 2024-12-12: Added year/month dropdowns for selecting historic dates (DOB use case)
 * - 2024-05-23: Added accessibility attributes (ARIA labels, roles)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface GlassCalendarProps {
    selectedDate?: Date;
    onSelect: (date: Date) => void;
    eventDates?: string[]; // Array of YYYY-MM-DD
    className?: string;
    minYear?: number; // Minimum selectable year (default: 1920)
    maxYear?: number; // Maximum selectable year (default: current year + 5)
}

export default function GlassCalendar({
    selectedDate,
    onSelect,
    eventDates = [],
    className = '',
    minYear = 1920,
    maxYear = new Date().getFullYear() + 5
}: GlassCalendarProps) {
    const [viewDate, setViewDate] = useState(selectedDate || new Date());
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [showYearDropdown, setShowYearDropdown] = useState(false);

    // Update view if selectedDate changes externally
    useEffect(() => {
        if (selectedDate) setViewDate(selectedDate);
    }, [selectedDate]);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    // Generate year options
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

    const prevMonth = () => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
        if (newDate.getFullYear() >= minYear) {
            setViewDate(newDate);
        }
    };

    const nextMonth = () => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
        if (newDate.getFullYear() <= maxYear) {
            setViewDate(newDate);
        }
    };

    const selectMonth = (monthIndex: number) => {
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
        setShowMonthDropdown(false);
    };

    const selectYear = (year: number) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setShowYearDropdown(false);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return day === selectedDate.getDate() && viewDate.getMonth() === selectedDate.getMonth() && viewDate.getFullYear() === selectedDate.getFullYear();
    };

    const formatDateKey = (day: number) => {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        return d.toISOString().split('T')[0];
    };

    // Close dropdowns when clicking outside
    const handleCalendarClick = (e: React.MouseEvent) => {
        // Only close if clicking on the calendar background, not dropdowns
        const target = e.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
            setShowMonthDropdown(false);
            setShowYearDropdown(false);
        }
    };

    return (
        <div className={`bg-zinc-900 border border-white/10 shadow-2xl p-4 rounded-xl ${className}`} onClick={handleCalendarClick}>
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevMonth(); }}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Month/Year Selectors */}
                <div className="flex items-center gap-1">
                    {/* Month Dropdown */}
                    <div className="relative dropdown-container">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMonthDropdown(!showMonthDropdown);
                                setShowYearDropdown(false);
                            }}
                            className="px-2 py-1 rounded-lg hover:bg-white/10 text-sm font-bold text-white flex items-center gap-1 transition-colors"
                            aria-label="Select month"
                            aria-expanded={showMonthDropdown}
                            aria-haspopup="listbox"
                        >
                            {monthNamesShort[viewDate.getMonth()]}
                            <ChevronDown className="w-3 h-3 text-white/50" />
                        </button>

                        {showMonthDropdown && (
                            <div className="absolute top-full left-0 mt-1 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-2 grid grid-cols-3 gap-1 w-40" role="listbox">
                                {monthNamesShort.map((month, index) => (
                                    <button
                                        key={month}
                                        role="option"
                                        aria-selected={viewDate.getMonth() === index}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); selectMonth(index); }}
                                        className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${viewDate.getMonth() === index
                                            ? 'bg-emerald-500 text-white'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {month}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Year Dropdown */}
                    <div className="relative dropdown-container">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowYearDropdown(!showYearDropdown);
                                setShowMonthDropdown(false);
                            }}
                            className="px-2 py-1 rounded-lg hover:bg-white/10 text-sm font-bold text-white flex items-center gap-1 transition-colors"
                            aria-label="Select year"
                            aria-expanded={showYearDropdown}
                            aria-haspopup="listbox"
                        >
                            {viewDate.getFullYear()}
                            <ChevronDown className="w-3 h-3 text-white/50" />
                        </button>

                        {showYearDropdown && (
                            <div className="absolute top-full right-0 mt-1 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-2 max-h-48 overflow-y-auto w-24 scrollbar-thin scrollbar-thumb-white/20" role="listbox">
                                {years.map(year => (
                                    <button
                                        key={year}
                                        role="option"
                                        aria-selected={viewDate.getFullYear() === year}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); selectYear(year); }}
                                        className={`w-full px-2 py-1.5 text-xs rounded-lg transition-colors text-center ${viewDate.getFullYear() === year
                                            ? 'bg-emerald-500 text-white'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextMonth(); }}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    aria-label="Next month"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 border-b border-white/5 mb-1" aria-hidden="true">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-[10px] font-semibold text-white/40 py-2 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border-l border-white/5 relative bg-black/20 rounded-lg overflow-hidden" role="grid">
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

                    // Create accessible label: "Monday, January 1, 2024"
                    const fullDateLabel = date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    return (
                        <button
                            key={day}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(date); }}
                            aria-label={fullDateLabel}
                            aria-selected={isSelectedDay}
                            aria-current={isTodayDay ? 'date' : undefined}
                            className={`
                                aspect-square flex items-center justify-center text-xs font-medium transition-all relative
                                border-r border-b border-white/5
                                ${isSelectedDay ? 'bg-emerald-500/20 text-emerald-400 z-10' : 'text-white/80 hover:bg-white/5 hover:text-white'}
                            `}
                        >
                            {isTodayDay && <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-emerald-400"></span>}
                            {hasEvent && !isSelectedDay && !isTodayDay && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white/30"></span>}

                            <span className={`w-6 h-6 flex items-center justify-center rounded-lg ${isSelectedDay ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : ''}`} aria-hidden="true">
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
