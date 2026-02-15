/**
 * @file date.ts
 * @description Date utility functions
 */

/**
 * Checks if a date string matches the given month (1-12) and day (1-31).
 * Uses charCodeAt to avoid string allocation and parsing overhead.
 * Handles YYYY-MM-DD, YYYY-M-D, YYYY-MM-D, YYYY-M-DD formats.
 *
 * @param dateStr - Date string in 'YYYY-MM-DD' or 'YYYY-M-D' format
 * @param targetMonth - Target month (1-12)
 * @param targetDay - Target day (1-31)
 * @returns true if the date string matches the target month and day
 */
export function isSameMonthAndDay(dateStr: string | undefined | null, targetMonth: number, targetDay: number): boolean {
    if (!dateStr) return false;
    const len = dateStr.length;

    // Fast path for standard YYYY-MM-DD (most common)
    if (len === 10) {
        if (dateStr.charCodeAt(4) !== 45 || dateStr.charCodeAt(7) !== 45) return false;

        // Month (5,6)
        // '0' is 48
        const m1 = dateStr.charCodeAt(5) - 48;
        const m2 = dateStr.charCodeAt(6) - 48;
        const month = m1 * 10 + m2;

        if (month !== targetMonth) return false;

        // Day (8,9)
        const d1 = dateStr.charCodeAt(8) - 48;
        const d2 = dateStr.charCodeAt(9) - 48;
        const day = d1 * 10 + d2;

        return day === targetDay;
    }

    // Robust path for non-padded dates (e.g. 1990-1-5)
    if (len >= 8 && len <= 9) {
        if (dateStr.charCodeAt(4) !== 45) return false;

        let secondSep = -1;
        // Check index 6 (YYYY-M-...)
        if (dateStr.charCodeAt(6) === 45) secondSep = 6;
        // Check index 7 (YYYY-MM-...)
        else if (dateStr.charCodeAt(7) === 45) secondSep = 7;
        else return false;

        // Parse Month
        let month = 0;
        for (let i = 5; i < secondSep; i++) {
            const code = dateStr.charCodeAt(i);
            // Validate numeric
            if (code < 48 || code > 57) return false;
            month = month * 10 + (code - 48);
        }
        if (month !== targetMonth) return false;

        // Parse Day
        let day = 0;
        for (let i = secondSep + 1; i < len; i++) {
            const code = dateStr.charCodeAt(i);
            if (code < 48 || code > 57) return false;
            day = day * 10 + (code - 48);
        }
        return day === targetDay;
    }

    return false;
}
