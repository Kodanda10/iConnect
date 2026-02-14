/**
 * @file date.ts
 * @description Date utility functions optimized for performance
 */

/**
 * Optimized date matching for YYYY-MM-DD strings.
 * Avoids string splitting and parsing allocation for standard formats.
 *
 * @param dateStr - The date string to check (usually YYYY-MM-DD)
 * @param targetMonth - The month to match (1-12)
 * @param targetDay - The day to match (1-31)
 */
export function isDateMatch(dateStr: string | undefined | null, targetMonth: number, targetDay: number): boolean {
    if (!dateStr) return false;

    // Fast path: Standard YYYY-MM-DD format (length 10)
    // We check for hyphens at expected positions 4 and 7 to be safe.
    // '0' is char code 48. '-' is char code 45.
    if (dateStr.length === 10 && dateStr.charCodeAt(4) === 45 && dateStr.charCodeAt(7) === 45) {
         // Parse Month (indices 5, 6)
         const m1 = dateStr.charCodeAt(5) - 48;
         const m2 = dateStr.charCodeAt(6) - 48;
         const month = m1 * 10 + m2;

         if (month !== targetMonth) return false;

         // Parse Day (indices 8, 9)
         const d1 = dateStr.charCodeAt(8) - 48;
         const d2 = dateStr.charCodeAt(9) - 48;
         const day = d1 * 10 + d2;

         return day === targetDay;
    }

    // Fallback: Split for non-standard formats (e.g. YYYY-M-D)
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;

    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);

    return m === targetMonth && d === targetDay;
}
