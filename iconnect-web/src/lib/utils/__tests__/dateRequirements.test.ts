/**
 * @file lib/utils/__tests__/dateRequirements.test.ts
 * @description TDD tests for constituent date validation requirements
 * @changelog
 * - 2024-12-17: Initial TDD implementation - DOB/Anniversary mandatory validation
 */

import { validateConstituentDates } from '../dateRequirements';

describe('validateConstituentDates', () => {
    // ============================================
    // RED: These tests should FAIL initially
    // ============================================

    describe('Mandatory Date Requirement', () => {
        test('rejects entry with neither DOB nor Anniversary', () => {
            const result = validateConstituentDates(undefined, undefined);

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Either Date of Birth or Anniversary is required');
        });

        test('rejects entry with empty strings for both dates', () => {
            const result = validateConstituentDates('', '');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Either Date of Birth or Anniversary is required');
        });

        test('accepts entry with only DOB provided', () => {
            const result = validateConstituentDates('1990-05-15', undefined);

            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        test('accepts entry with only Anniversary provided', () => {
            const result = validateConstituentDates(undefined, '2010-06-20');

            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        test('accepts entry with both DOB and Anniversary provided', () => {
            const result = validateConstituentDates('1990-05-15', '2010-06-20');

            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });
});
