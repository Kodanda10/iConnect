/**
 * @file date.ts
 * @description Date utility functions
 */

/**
 * Check if a date string matches a target date (month and day only, ignoring year).
 * Optimized to use charCodeAt for standard YYYY-MM-DD format to avoid string allocations.
 *
 * @param dateStr - Date string, typically in YYYY-MM-DD format
 * @param targetDate - The target date to match against
 * @returns boolean
 */
export function isDateMatch(dateStr: string | undefined, targetDate: Date): boolean {
    if (!dateStr) return false;

    // Fast path for standard YYYY-MM-DD format
    if (dateStr.length === 10 && dateStr.charCodeAt(4) === 45 && dateStr.charCodeAt(7) === 45) {
        // Parse month (indices 5,6)
        // '0' is 48
        const m1 = dateStr.charCodeAt(5) - 48;
        const m2 = dateStr.charCodeAt(6) - 48;
        const month = m1 * 10 + m2 - 1; // 0-indexed for Date comparison

        // Parse day (indices 8,9)
        const d1 = dateStr.charCodeAt(8) - 48;
        const d2 = dateStr.charCodeAt(9) - 48;
        const day = d1 * 10 + d2;

        return (
            day === targetDate.getDate() &&
            month === targetDate.getMonth()
        );
    }

    // Fallback for robustness (e.g. if format is different or malformed)
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;

    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed

    return (
        day === targetDate.getDate() &&
        month === targetDate.getMonth()
    );
}
