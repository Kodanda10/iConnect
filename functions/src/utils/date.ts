/**
 * @file date.ts
 * @description High-performance date utility functions
 */

/**
 * Checks if the YYYY-MM-DD string matches the target month and day.
 * Zero-allocation implementation using charCodeAt for optimal performance in hot loops.
 *
 * @param dateStr Date string in YYYY-MM-DD format
 * @param targetMonth 1-based month (1-12)
 * @param targetDay Day of month (1-31)
 */
export function isDateMatch(dateStr: string | undefined | null, targetMonth: number, targetDay: number): boolean {
    // 1. Quick length check (YYYY-MM-DD is 10 chars)
    if (!dateStr || dateStr.length !== 10) return false;

    // 2. Format validation: Check for hyphens at expected positions
    // charCodeAt(4) and (7) must be '-' (45)
    if (dateStr.charCodeAt(4) !== 45 || dateStr.charCodeAt(7) !== 45) return false;

    // 3. Parse Month (index 5, 6)
    // '0'.charCodeAt(0) is 48
    const m1 = dateStr.charCodeAt(5) - 48;
    const m2 = dateStr.charCodeAt(6) - 48;
    const month = m1 * 10 + m2;

    if (month !== targetMonth) return false;

    // 4. Parse Day (index 8, 9)
    const d1 = dateStr.charCodeAt(8) - 48;
    const d2 = dateStr.charCodeAt(9) - 48;
    const day = d1 * 10 + d2;

    return day === targetDay;
}
