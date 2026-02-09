import { sanitizeInput, redactMobile, redactEmail, redactToken } from '../utils/security';

describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        test('should return empty string for null/undefined', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
        });

        test('should return same string for safe input', () => {
            expect(sanitizeInput('Hello World')).toBe('Hello World');
            expect(sanitizeInput('1234567890')).toBe('1234567890');
        });

        test('should escape special characters', () => {
            expect(sanitizeInput('<script>')).toBe('&lt;script&gt;');
            expect(sanitizeInput('"Hello" & \'World\'')).toBe('&quot;Hello&quot; &amp; &apos;World&apos;');
            expect(sanitizeInput('Me & You')).toBe('Me &amp; You');
        });

        test('should handle mixed content', () => {
            const input = 'Hello <User>!';
            expect(sanitizeInput(input)).toBe('Hello &lt;User&gt;!');
        });
    });

    describe('redactMobile', () => {
        test('should redact valid mobile', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
        });

        test('should handle short mobile numbers', () => {
            expect(redactMobile('123')).toBe('***');
        });

        test('should handle missing mobile', () => {
            expect(redactMobile(null)).toBe('[MISSING]');
        });
    });

    describe('redactEmail', () => {
        test('should redact valid email', () => {
            expect(redactEmail('john.doe@example.com')).toBe('jo***@example.com');
        });

        test('should handle invalid email', () => {
            expect(redactEmail('invalid-email')).toBe('[INVALID_EMAIL]');
        });
    });

    describe('redactToken', () => {
        test('should redact long token', () => {
            expect(redactToken('abcdef1234567890')).toBe('abcd...7890');
        });
    });
});
