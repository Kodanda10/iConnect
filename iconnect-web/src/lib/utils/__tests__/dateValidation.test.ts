/**
 * @file utils/__tests__/dateValidation.test.ts
 * @description TDD test suite for DD/MM/YYYY date validation (Indian format)
 * @changelog
 * - 2024-12-17: Initial TDD implementation with 20 edge cases
 */

import {
    formatDateForDisplay,
    formatDateInput,
    isValidDate,
    parseDateInput,
    getValidationState,
    ValidationState
} from '../dateValidation';

describe('Date Validation Utility (DD/MM/YYYY Indian Format)', () => {

    // ============================================
    // formatDateForDisplay: Storage → Display
    // ============================================
    describe('formatDateForDisplay', () => {
        test('converts YYYY-MM-DD to DD/MM/YYYY', () => {
            expect(formatDateForDisplay('2025-12-16')).toBe('16/12/2025');
        });

        test('returns empty string for empty input', () => {
            expect(formatDateForDisplay('')).toBe('');
        });

        test('returns input unchanged if not in YYYY-MM-DD format', () => {
            expect(formatDateForDisplay('16/12/2025')).toBe('16/12/2025');
        });
    });

    // ============================================
    // formatDateInput: Auto-masking while typing
    // ============================================
    describe('formatDateInput (auto-masking)', () => {
        test('adds slash after 2 digits: 16 → 16/', () => {
            expect(formatDateInput('16')).toBe('16/');
        });

        test('formats 1612 to 16/12/', () => {
            expect(formatDateInput('1612')).toBe('16/12/');
        });

        test('formats 16122025 to 16/12/2025', () => {
            expect(formatDateInput('16122025')).toBe('16/12/2025');
        });

        test('limits to 10 characters max', () => {
            const result = formatDateInput('161220251234');
            expect(result.length).toBeLessThanOrEqual(10);
            expect(result).toBe('16/12/2025');
        });

        test('removes non-numeric characters', () => {
            expect(formatDateInput('16a12b2025c')).toBe('16/12/2025');
        });

        test('handles backspace correctly: 16/12/ → 16/1', () => {
            // User deleted last char from 16/12/
            expect(formatDateInput('16/1')).toBe('16/1');
        });

        test('standardizes dashes to slashes: 12-12-2024 → blocked', () => {
            expect(formatDateInput('12-12-2024')).toBe('12/12/2024');
        });
    });

    // ============================================
    // isValidDate: Complete validation
    // ============================================
    describe('isValidDate (20 Edge Cases)', () => {
        // Case 1: Empty field
        test('Case 1: Empty field → Invalid', () => {
            expect(isValidDate('')).toBe(false);
        });

        // Case 2: All zeros
        test('Case 2: 00/00/0000 → Invalid', () => {
            expect(isValidDate('00/00/0000')).toBe(false);
        });

        // Case 3: Invalid day > 31
        test('Case 3: 32/01/2024 → Invalid (day > 31)', () => {
            expect(isValidDate('32/01/2024')).toBe(false);
        });

        // Case 4: Invalid month > 12
        test('Case 4: 15/13/2024 → Invalid (month > 12)', () => {
            expect(isValidDate('15/13/2024')).toBe(false);
        });

        // Case 5: Year out of range (< 1900)
        test('Case 5: 12/12/1899 → Invalid (year < 1900)', () => {
            expect(isValidDate('12/12/1899')).toBe(false);
        });

        // Case 6: Valid leap year
        test('Case 6: 29/02/2024 → Valid (leap year)', () => {
            expect(isValidDate('29/02/2024')).toBe(true);
        });

        // Case 7: Invalid non-leap year Feb 29
        test('Case 7: 29/02/2023 → Invalid (non-leap year)', () => {
            expect(isValidDate('29/02/2023')).toBe(false);
        });

        // Case 8: Feb 30 never valid
        test('Case 8: 30/02/2024 → Invalid (Feb max 29)', () => {
            expect(isValidDate('30/02/2024')).toBe(false);
        });

        // Case 9: April has 30 days
        test('Case 9: 31/04/2024 → Invalid (April has 30 days)', () => {
            expect(isValidDate('31/04/2024')).toBe(false);
        });

        // Case 10: June has 30 days
        test('Case 10: 31/06/2024 → Invalid (June has 30 days)', () => {
            expect(isValidDate('31/06/2024')).toBe(false);
        });

        // Case 11: September has 30 days
        test('Case 11: 31/09/2024 → Invalid (Sept has 30 days)', () => {
            expect(isValidDate('31/09/2024')).toBe(false);
        });

        // Case 12: November has 30 days
        test('Case 12: 31/11/2024 → Invalid (Nov has 30 days)', () => {
            expect(isValidDate('31/11/2024')).toBe(false);
        });

        // Case 13: Valid December 31
        test('Case 13: 31/12/2024 → Valid', () => {
            expect(isValidDate('31/12/2024')).toBe(true);
        });

        // Case 14: Valid January 1
        test('Case 14: 01/01/2024 → Valid', () => {
            expect(isValidDate('01/01/2024')).toBe(true);
        });

        // Case 15: Partial entry - day only
        test('Case 15: "12/" → Invalid (partial)', () => {
            expect(isValidDate('12/')).toBe(false);
        });

        // Case 16: Partial entry - missing year digit
        test('Case 16: "12/12/202" → Invalid (partial year)', () => {
            expect(isValidDate('12/12/202')).toBe(false);
        });

        // Case 17: String input blocked
        test('Case 17: "aa/bb/cccc" → Invalid (non-numeric)', () => {
            expect(isValidDate('aa/bb/cccc')).toBe(false);
        });

        // Case 18: Future dates for DOB vs Meeting
        test('Case 18: Future date 01/01/2030 → Valid format (context determines usage)', () => {
            // The function validates format; context-specific rules applied at component level
            expect(isValidDate('01/01/2030')).toBe(true);
        });

        // Case 19: Wrong separator (dashes)
        test('Case 19: "12-12-2024" → Invalid (wrong separator)', () => {
            expect(isValidDate('12-12-2024')).toBe(false);
        });

        // Case 20: Day zero
        test('Case 20: "00/12/2024" → Invalid (day = 0)', () => {
            expect(isValidDate('00/12/2024')).toBe(false);
        });
    });

    // ============================================
    // getValidationState: UI feedback
    // ============================================
    describe('getValidationState (UI feedback)', () => {
        test('empty string → neutral', () => {
            expect(getValidationState('')).toBe('neutral');
        });

        test('partial input "12/" → error', () => {
            expect(getValidationState('12/')).toBe('error');
        });

        test('partial input "12/12/202" → error', () => {
            expect(getValidationState('12/12/202')).toBe('error');
        });

        test('invalid complete date "32/12/2024" → error', () => {
            expect(getValidationState('32/12/2024')).toBe('error');
        });

        test('valid date "16/12/2024" → success', () => {
            expect(getValidationState('16/12/2024')).toBe('success');
        });
    });

    // ============================================
    // parseDateInput: Display → Storage
    // ============================================
    describe('parseDateInput', () => {
        test('valid input returns YYYY-MM-DD', () => {
            expect(parseDateInput('16/12/2025')).toBe('2025-12-16');
        });

        test('invalid date returns null', () => {
            expect(parseDateInput('32/12/2025')).toBeNull();
        });

        test('partial date returns null', () => {
            expect(parseDateInput('16/12/')).toBeNull();
        });

        test('empty string returns null', () => {
            expect(parseDateInput('')).toBeNull();
        });
    });
});
