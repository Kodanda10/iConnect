import { isDateMatch } from '../utils/date';

describe('isDateMatch (Optimized)', () => {
    // Valid Matches
    test('should match correct date string', () => {
        expect(isDateMatch('1990-05-15', 5, 15)).toBe(true);
        expect(isDateMatch('2023-12-31', 12, 31)).toBe(true);
        expect(isDateMatch('2000-01-01', 1, 1)).toBe(true);
    });

    // Valid Mismatches
    test('should return false for mismatched date', () => {
        expect(isDateMatch('1990-05-15', 5, 14)).toBe(false); // Wrong day
        expect(isDateMatch('1990-05-15', 6, 15)).toBe(false); // Wrong month
        expect(isDateMatch('1990-05-15', 12, 31)).toBe(false);
    });

    // Invalid Inputs
    test('should handle invalid inputs gracefully', () => {
        expect(isDateMatch(undefined, 5, 15)).toBe(false);
        expect(isDateMatch(null, 5, 15)).toBe(false);
        expect(isDateMatch('', 5, 15)).toBe(false);
        expect(isDateMatch('invalid-date', 5, 15)).toBe(false); // Length check
        expect(isDateMatch('1990/05/15', 5, 15)).toBe(false); // Wrong separator
        expect(isDateMatch('90-05-15', 5, 15)).toBe(false); // Too short
    });

    // Edge Cases
    test('should handle single digit months/days in parsing logic', () => {
        // '2023-05-09' -> Month 05 -> 5, Day 09 -> 9
        expect(isDateMatch('2023-05-09', 5, 9)).toBe(true);
    });

    test('should validate hyphen positions', () => {
        // '2023005-15' -> Length 10 but char at 4 is '0'
        expect(isDateMatch('2023005-15', 5, 15)).toBe(false);
    });
});
