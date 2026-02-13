
import { sanitizeInput, redactMobile, redactToken } from '../utils/security';

describe('Security Utils', () => {
    describe('sanitizeInput', () => {
        test('escapes HTML/XML special characters', () => {
            const input = '<script>alert("xss")</script>';
            const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        test('handles ampersand correctly', () => {
            const input = 'Tom & Jerry';
            const expected = 'Tom &amp; Jerry';
            expect(sanitizeInput(input)).toBe(expected);
        });

        test('handles single quotes correctly', () => {
            const input = "O'Connor";
            const expected = "O&#39;Connor";
            expect(sanitizeInput(input)).toBe(expected);
        });

        test('handles undefined/null input', () => {
             expect(sanitizeInput(undefined)).toBe('');
             expect(sanitizeInput(null)).toBe('');
        });

        test('returns safe string as is', () => {
            const input = 'Hello World';
            expect(sanitizeInput(input)).toBe('Hello World');
        });
    });

    describe('redactMobile', () => {
        test('redacts mobile number correctly', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
        });

        test('handles short numbers', () => {
             expect(redactMobile('123')).toBe('***');
        });

        test('handles null/undefined', () => {
            expect(redactMobile(null)).toBe('[MISSING]');
            expect(redactMobile(undefined)).toBe('[MISSING]');
        });
    });

    describe('redactToken', () => {
        test('redacts token correctly', () => {
             expect(redactToken('abcdef1234567890')).toBe('abcd...7890');
        });

        test('handles missing token', () => {
            expect(redactToken(null)).toBe('[MISSING]');
        });
    });
});
