import { sanitizeInput, redactMobile, redactToken } from '../utils/security';

describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        test('should escape HTML special characters', () => {
            const input = '<script>alert("xss")</script>';
            const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        test('should handle ampersands correctly', () => {
            const input = 'Tom & Jerry';
            const expected = 'Tom &amp; Jerry';
            expect(sanitizeInput(input)).toBe(expected);
        });

        test('should handle single quotes', () => {
            const input = "It's me";
            const expected = "It&#039;s me";
            expect(sanitizeInput(input)).toBe(expected);
        });

        test('should return empty string for null or undefined', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
        });

        test('should return empty string for empty input', () => {
            expect(sanitizeInput('')).toBe('');
        });
    });

    describe('redactMobile', () => {
        test('should redact valid mobile number', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
        });

        test('should handle short numbers', () => {
            expect(redactMobile('123')).toBe('***');
        });

        test('should handle missing input', () => {
            expect(redactMobile(null)).toBe('[MISSING]');
        });
    });

    describe('redactToken', () => {
        test('should redact long token', () => {
            expect(redactToken('abcdef1234567890')).toBe('abcd...7890');
        });
    });
});
