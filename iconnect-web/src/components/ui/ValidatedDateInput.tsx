/**
 * @file components/ui/ValidatedDateInput.tsx
 * @description Reusable DD/MM/YYYY date input with real-time validation and accessible UX
 * @changelog
 * - 2024-12-17: Initial TDD implementation with red/green borders
 * - 2025-02-20: 🎨 Palette UX improvements (delayed validation, a11y error message, keyboard support)
 */

'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
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
    const id = useId();
    const calendarId = `${id}-calendar`;
    const errorId = `${id}-error`;

    const [displayValue, setDisplayValue] = useState(formatDateForDisplay(value));
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
    const [isTouched, setIsTouched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync external value changes
    useEffect(() => {
        setDisplayValue(formatDateForDisplay(value));
    }, [value]);

    // Get current validation state
    const validationState = getValidationState(displayValue, allowFuture);

    // Improved UX: Only show error if touched OR if value is complete but invalid
    // This prevents aggressive red borders while the user is still typing
    const shouldShowError = validationState === 'error' && (isTouched || displayValue.length === 10);
    const shouldShowSuccess = validationState === 'success';

    // Handle text input with auto-masking
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formatted = formatDateInput(rawValue);

        setDisplayValue(formatted);

        // Reset touched state if user clears input to start over
        if (formatted === '') {
            setIsTouched(false);
        }

        // Try to parse and send valid date to parent
        const parsed = parseDateInput(formatted);
        if (parsed) {
            onChange(parsed);
        } else {
            // Send formatted display value for partial input
            onChange(formatted);
        }
    };

    const handleBlur = () => {
        setIsTouched(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        // Open calendar on Alt+ArrowDown (standard combobox behavior)
        if (e.altKey && e.key === 'ArrowDown') {
            e.preventDefault();
            openCalendar();
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
        // Focus back on input after selection
        inputRef.current?.focus();
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
        if (shouldShowSuccess) {
            return 'border-emerald-500 ring-2 ring-emerald-500/20';
        }
        if (shouldShowError) {
            return 'border-red-500 ring-2 ring-red-500/20';
        }
        return 'border-white/20 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20';
    };

    const getIcon = () => {
        if (shouldShowSuccess) {
            return <Check className="w-5 h-5 text-emerald-500" />;
        }
        if (shouldShowError) {
            return <AlertCircle className="w-5 h-5 text-red-500" />;
        }
        return <Calendar className="w-5 h-5 text-gray-400" />;
    };

    const getErrorMessage = () => {
        if (!shouldShowError) return null;
        if (!displayValue) return "Date is required"; // Should not happen with current logic as empty is neutral
        if (displayValue.length < 10) return "Please enter a complete date (DD/MM/YYYY)";
        if (!allowFuture && validationState === 'error') return "Future dates are not allowed";
        return "Invalid date. Please check the format.";
    };

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-white/80 mb-2">
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
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-md"
                    aria-label="Toggle calendar"
                    aria-expanded={isCalendarOpen}
                    aria-haspopup="dialog"
                    aria-controls={isCalendarOpen ? calendarId : undefined}
                >
                    {getIcon()}
                </button>

                {/* Text Input */}
                <input
                    id={id}
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={10}
                    aria-invalid={shouldShowError}
                    aria-errormessage={shouldShowError ? errorId : undefined}
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                />
            </div>

            {/* Accessible Error Message */}
            {shouldShowError && (
                <p id={errorId} role="alert" className="mt-1 text-xs text-red-400 font-medium ml-1 animate-in slide-in-from-top-1">
                    {getErrorMessage()}
                </p>
            )}

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
                        id={calendarId}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Calendar date picker"
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
