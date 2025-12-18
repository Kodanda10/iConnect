/**
 * @file utils/dateValidation.ts
 * @description Centralized DD/MM/YYYY date validation utility for Indian format
 * @changelog
 * - 2024-12-17: Initial TDD implementation with strict validation
 */

export type ValidationState = 'neutral' | 'error' | 'success';

/**
 * Convert storage format (YYYY-MM-DD) to display format (DD/MM/YYYY)
 */
export function formatDateForDisplay(dateStr: string): string {
    if (!dateStr) return '';

    // Check if already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    }

    return dateStr;
}

/**
 * Auto-format user input while typing (DD/MM/YYYY)
 * Strips non-numeric chars, adds slashes at correct positions
 */
export function formatDateInput(value: string): string {
    // Remove everything except digits
    const digits = value.replace(/\D/g, '');

    // Limit to 8 digits (DDMMYYYY)
    const limited = digits.slice(0, 8);

    // Build formatted string with slashes
    let formatted = '';
    for (let i = 0; i < limited.length; i++) {
        if (i === 2 || i === 4) {
            formatted += '/';
        }
        formatted += limited[i];
    }

    // Add trailing slash after day (2 digits) if user is still typing
    if (limited.length === 2) {
        formatted += '/';
    }

    // Add trailing slash after month (4 digits) if user is still typing
    if (limited.length === 4) {
        formatted += '/';
    }

    return formatted;
}

/**
 * Check if a year is a leap year
 */
function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get the maximum days in a month
 */
function getDaysInMonth(month: number, year: number): number {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (month === 2 && isLeapYear(year)) {
        return 29;
    }

    return daysInMonth[month - 1];
}

/**
 * Validate a complete date string in DD/MM/YYYY format
 * Returns true only for valid, real dates
 */
export function isValidDate(dateStr: string, allowFuture = true): boolean {
    if (!dateStr) return false;

    // Must match DD/MM/YYYY pattern exactly (with slashes)
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return false;

    const [, dayStr, monthStr, yearStr] = match;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    // Year range: 1900 to 2100
    if (year < 1900 || year > 2100) return false;

    // Month range: 1 to 12
    if (month < 1 || month > 12) return false;

    // Day range: 1 to max days in month (handles Feb, 30-day months, leap years)
    const maxDays = getDaysInMonth(month, year);
    if (day < 1 || day > maxDays) return false;

    // Strict Future Check if requested
    if (!allowFuture) {
        const inputDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (inputDate > today) return false;
    }

    return true;
}

/**
 * Get validation state for UI feedback (red/green border)
 */
export function getValidationState(dateStr: string, allowFuture = true): ValidationState {
    // Empty = neutral (no red/green)
    if (!dateStr || dateStr.length === 0) {
        return 'neutral';
    }

    // Check if it's a complete date (10 chars: DD/MM/YYYY)
    if (dateStr.length === 10) {
        return isValidDate(dateStr, allowFuture) ? 'success' : 'error';
    }

    // Partial input = error (incomplete)
    return 'error';
}

/**
 * Parse user input and return storage format (YYYY-MM-DD) if valid
 * Returns null if date is invalid or incomplete
 */
export function parseDateInput(dateStr: string): string | null {
    if (!isValidDate(dateStr)) return null;

    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
}
