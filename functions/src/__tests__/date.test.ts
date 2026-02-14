import { isDateMatch } from '../utils/date';

describe('isDateMatch', () => {
    // Fast path: YYYY-MM-DD
    it('matches valid YYYY-MM-DD string correctly', () => {
        expect(isDateMatch('1990-12-18', 12, 18)).toBe(true);
        expect(isDateMatch('2000-01-01', 1, 1)).toBe(true);
        expect(isDateMatch('1999-02-28', 2, 28)).toBe(true);
    });

    it('returns false for mismatching YYYY-MM-DD string', () => {
        expect(isDateMatch('1990-12-18', 12, 19)).toBe(false); // Wrong day
        expect(isDateMatch('1990-12-18', 11, 18)).toBe(false); // Wrong month
        expect(isDateMatch('1990-12-18', 1, 18)).toBe(false); // Wrong month
    });

    // Slow path: Non-standard formats (e.g., YYYY-M-D)
    it('matches valid non-padded YYYY-M-D string correctly (fallback)', () => {
        expect(isDateMatch('1990-1-1', 1, 1)).toBe(true);
        expect(isDateMatch('1990-12-1', 12, 1)).toBe(true);
        expect(isDateMatch('1990-1-18', 1, 18)).toBe(true);
    });

    it('returns false for mismatching non-standard string', () => {
        expect(isDateMatch('1990-1-1', 1, 2)).toBe(false);
    });

    // Edge cases and invalid inputs
    it('returns false for invalid inputs', () => {
        expect(isDateMatch(undefined, 1, 1)).toBe(false);
        expect(isDateMatch(null, 1, 1)).toBe(false);
        expect(isDateMatch('', 1, 1)).toBe(false);
        expect(isDateMatch('invalid', 1, 1)).toBe(false);
        expect(isDateMatch('1990/12/18', 12, 18)).toBe(false); // Wrong separator
    });

    // Boundary checks
    it('handles boundary months and days', () => {
        expect(isDateMatch('2023-12-31', 12, 31)).toBe(true);
        expect(isDateMatch('2023-01-01', 1, 1)).toBe(true);
    });

    // Malformed strings that happen to have correct length
    it('ignores year component even if malformed', () => {
        // As long as it matches YYYY-MM-DD structure at relevant indices
        expect(isDateMatch('ABCD-12-18', 12, 18)).toBe(true);
    });

    it('rejects strings with wrong separators in fast path', () => {
        // "1990/12/18" len 10.
        // Index 4 is '/'. charCode is 47. != 45.
        // Should fall back to split.
        // split('-') returns ["1990/12/18"]. length 1.
        // returns false.
        expect(isDateMatch('1990/12/18', 12, 18)).toBe(false);
    });
});
