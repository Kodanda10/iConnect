import { isSameMonthAndDay } from '../utils/date';

describe('isSameMonthAndDay', () => {
    describe('Standard YYYY-MM-DD (len 10)', () => {
        test('matches correctly when month and day are same', () => {
            expect(isSameMonthAndDay('1990-12-18', 12, 18)).toBe(true);
            expect(isSameMonthAndDay('2000-01-01', 1, 1)).toBe(true);
        });

        test('returns false when day is different', () => {
            expect(isSameMonthAndDay('1990-12-18', 12, 19)).toBe(false);
        });

        test('returns false when month is different', () => {
            expect(isSameMonthAndDay('1990-12-18', 11, 18)).toBe(false);
        });

        test('returns false for invalid separators', () => {
            expect(isSameMonthAndDay('2023/12/18', 12, 18)).toBe(false);
            expect(isSameMonthAndDay('2023.12.18', 12, 18)).toBe(false);
        });
    });

    describe('Non-padded Formats (len 8-9)', () => {
        test('matches YYYY-M-D (len 8)', () => {
            expect(isSameMonthAndDay('2023-1-5', 1, 5)).toBe(true);
            expect(isSameMonthAndDay('2023-1-5', 1, 6)).toBe(false);
            expect(isSameMonthAndDay('2023-2-5', 1, 5)).toBe(false);
        });

        test('matches YYYY-M-DD (len 9)', () => {
            expect(isSameMonthAndDay('2023-1-05', 1, 5)).toBe(true);
            expect(isSameMonthAndDay('2023-1-05', 1, 6)).toBe(false);
        });

        test('matches YYYY-MM-D (len 9)', () => {
            expect(isSameMonthAndDay('2023-12-5', 12, 5)).toBe(true);
            expect(isSameMonthAndDay('2023-12-5', 12, 6)).toBe(false);
        });
    });

    describe('Edge Cases & Invalid Inputs', () => {
        test('returns false for null or undefined', () => {
            expect(isSameMonthAndDay(null, 12, 18)).toBe(false);
            expect(isSameMonthAndDay(undefined, 12, 18)).toBe(false);
        });

        test('returns false for invalid length strings', () => {
            expect(isSameMonthAndDay('', 12, 18)).toBe(false);
            expect(isSameMonthAndDay('2023', 12, 18)).toBe(false);
            expect(isSameMonthAndDay('2023-12', 12, 18)).toBe(false); // Length 7
            expect(isSameMonthAndDay('2023-12-123', 12, 12)).toBe(false); // Too long
        });

        test('returns false for non-numeric date parts', () => {
            expect(isSameMonthAndDay('2023-MM-DD', 12, 18)).toBe(false);
            expect(isSameMonthAndDay('2023-A-B', 1, 1)).toBe(false);
        });

        test('handles single digit month/day in target correctly', () => {
            // Function handles target as number (1-12, 1-31)
            expect(isSameMonthAndDay('2023-01-05', 1, 5)).toBe(true);
        });
    });
});
