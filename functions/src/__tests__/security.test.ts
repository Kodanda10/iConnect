
import { sanitizeInput, redactMobile, redactToken } from '../utils/security';

describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        it('should escape HTML/XML special characters', () => {
            const input = '<script>alert("xss")</script>';
            const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle simple strings without changes', () => {
            const input = 'Hello World';
            expect(sanitizeInput(input)).toBe('Hello World');
        });

        it('should escape ampersands', () => {
            const input = 'Tom & Jerry';
            expect(sanitizeInput(input)).toBe('Tom &amp; Jerry');
        });

        it('should trim whitespace', () => {
            const input = '  spaced  ';
            expect(sanitizeInput(input)).toBe('spaced');
        });

        it('should handle empty input', () => {
            expect(sanitizeInput('')).toBe('');
            expect(sanitizeInput(null as any)).toBe('');
            expect(sanitizeInput(undefined as any)).toBe('');
        });
    });

    describe('redactMobile', () => {
        it('should redact valid mobile numbers', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
        });

        it('should handle short numbers', () => {
            expect(redactMobile('123')).toBe('***');
        });

        it('should handle missing input', () => {
            expect(redactMobile(null)).toBe('[MISSING]');
        });
    });

    describe('redactToken', () => {
        it('should redact long tokens', () => {
            expect(redactToken('abcdef1234567890')).toBe('abcd...7890');
        });
    });
});
