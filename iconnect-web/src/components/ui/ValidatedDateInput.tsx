/**
 * @file components/ui/ValidatedDateInput.tsx
 * @description Reusable DD/MM/YYYY date input with real-time validation
 * @changelog
 * - 2024-12-17: Initial TDD implementation with red/green borders
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Check, AlertCircle } from 'lucide-react';
import {
    formatDateForDisplay,
    formatDateInput,
    getValidationState,
    parseDateInput,
} from '@/lib/utils/dateValidation';
import GlassCalendar from './GlassCalendar';

interface ValidatedDateInputProps {
    value: string; // Storage format: YYYY-MM-DD or empty
    onChange: (value: string) => void; // Callback with YYYY-MM-DD or partial input
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    showCalendar?: boolean; // Enable calendar popup
    allowFuture?: boolean; // For meetings=true, for DOB=false
    className?: string;
}

export default function ValidatedDateInput({
    value,
    onChange,
    label,
    placeholder = 'DD/MM/YYYY',
    disabled = false,
    showCalendar = true,
    allowFuture = true,
    className = '',
}: ValidatedDateInputProps) {
    const [displayValue, setDisplayValue] = useState(formatDateForDisplay(value));
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync external value changes
    useEffect(() => {
        setDisplayValue(formatDateForDisplay(value));
    }, [value]);

    // Get current validation state
    const validationState = getValidationState(displayValue);

    // Handle text input with auto-masking
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formatted = formatDateInput(rawValue);

        setDisplayValue(formatted);

        // Try to parse and send valid date to parent
        const parsed = parseDateInput(formatted);
        if (parsed) {
            onChange(parsed);
        } else {
            // Send formatted display value for partial input
            onChange(formatted);
        }
    };

    // Handle calendar date selection
    const handleCalendarSelect = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const storageFormat = `${year}-${month}-${day}`;

        onChange(storageFormat);
        setDisplayValue(formatDateForDisplay(storageFormat));
        setIsCalendarOpen(false);
    };

    // Calculate position on open
    const openCalendar = () => {
        if (disabled || !showCalendar) return;

        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            // Use fixed positioning relative to viewport since we are portaling to body
            setCalendarPosition({
                top: rect.bottom + 8,
                left: rect.left,
            });
            setIsCalendarOpen(true);
        }
    };

    // Handle scroll/resize to close calendar to avoid detached popup
    useEffect(() => {
        const handleScroll = () => {
            if (isCalendarOpen) setIsCalendarOpen(false);
        };
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isCalendarOpen]);

    // Get border/icon styles based on validation state
    const getBorderClass = (): string => {
        switch (validationState) {
            case 'success':
                return 'border-emerald-500 ring-2 ring-emerald-500/20';
            case 'error':
                return 'border-red-500 ring-2 ring-red-500/20';
            default:
                return 'border-white/20 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20';
        }
    };

    const getIcon = () => {
        switch (validationState) {
            case 'success':
                return <Check className="w-5 h-5 text-emerald-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Calendar className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-white/80 mb-2">
                    {label}
                </label>
            )}

            <div className={`
                flex items-center gap-3 px-4 py-3 rounded-xl 
                bg-white/5 backdrop-blur-sm border transition-all duration-200
                ${getBorderClass()}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
            `}>
                {/* Calendar Icon / Status Icon */}
                <button
                    type="button"
                    onClick={openCalendar}
                    disabled={disabled || !showCalendar}
                    className="focus:outline-none"
                >
                    {getIcon()}
                </button>

                {/* Text Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={displayValue}
                    onChange={handleInputChange}
                    onFocus={openCalendar}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={10}
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                />
            </div>

            {/* Calendar Portal - Renders at root level to ensure Z-Index top */}
            {isCalendarOpen && showCalendar && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] isolate">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-transparent"
                        onClick={() => setIsCalendarOpen(false)}
                    />

                    {/* Popup */}
                    <div
                        className="fixed z-[99999] w-[320px] animate-in fade-in zoom-in-95 duration-100"
                        style={{
                            top: `${calendarPosition.top}px`,
                            left: `${calendarPosition.left}px`,
                        }}
                    >
                        <GlassCalendar
                            selectedDate={value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value) : undefined}
                            onSelect={handleCalendarSelect}
                            minYear={1900}
                            maxYear={allowFuture ? 2100 : new Date().getFullYear()}
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
