/**
 * @file __tests__/phone-validation.test.ts
 * @description TDD tests for phone number validation (Mobile and WhatsApp)
 * @changelog
 * - 2024-12-12: Initial implementation following TDD
 */

import { isValidIndianMobile, isValidWhatsApp } from '@/lib/utils/validation';

describe('Phone Number Validation', () => {
    // Test for valid 10-digit Indian mobile numbers
    describe('isValidIndianMobile', () => {
        test('accepts valid 10-digit number starting with 6-9', () => {
            expect(isValidIndianMobile('9876543210')).toBe(true);
            expect(isValidIndianMobile('8765432109')).toBe(true);
            expect(isValidIndianMobile('7654321098')).toBe(true);
            expect(isValidIndianMobile('6543210987')).toBe(true);
        });

        test('rejects numbers not starting with 6-9', () => {
            expect(isValidIndianMobile('5876543210')).toBe(false);
            expect(isValidIndianMobile('1234567890')).toBe(false);
            expect(isValidIndianMobile('0987654321')).toBe(false);
        });

        test('rejects numbers with wrong length', () => {
            expect(isValidIndianMobile('987654321')).toBe(false);   // 9 digits
            expect(isValidIndianMobile('98765432101')).toBe(false); // 11 digits
            expect(isValidIndianMobile('')).toBe(false);            // empty
        });

        test('rejects dummy/test numbers', () => {
            expect(isValidIndianMobile('9999999999')).toBe(false);
            expect(isValidIndianMobile('8888888888')).toBe(false);
            expect(isValidIndianMobile('1234567890')).toBe(false);
            expect(isValidIndianMobile('0000000000')).toBe(false);
        });

        test('rejects non-numeric input', () => {
            expect(isValidIndianMobile('98765abcde')).toBe(false);
            expect(isValidIndianMobile('phone12345')).toBe(false);
            expect(isValidIndianMobile('+919876543210')).toBe(false); // has + prefix
        });

        test('handles whitespace correctly', () => {
            expect(isValidIndianMobile(' 9876543210 ')).toBe(true); // trims
            expect(isValidIndianMobile('987 654 3210')).toBe(false); // spaces in middle
        });
    });

    // Same validation for WhatsApp
    describe('isValidWhatsApp', () => {
        test('accepts valid 10-digit WhatsApp number', () => {
            expect(isValidWhatsApp('9876543210')).toBe(true);
        });

        test('rejects invalid WhatsApp numbers', () => {
            expect(isValidWhatsApp('123')).toBe(false);
            expect(isValidWhatsApp('1234567890')).toBe(false); // starts with 1
        });

        test('allows empty WhatsApp (optional field)', () => {
            expect(isValidWhatsApp('')).toBe(true);
            expect(isValidWhatsApp(undefined)).toBe(true);
        });
    });
});

