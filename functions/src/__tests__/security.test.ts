import { sanitizeInput, redactMobile, redactEmail, redactToken } from '../utils/security';

describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        it('escapes XML special characters', () => {
            const input = '<script>alert("XSS")</script> & more';
            const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt; &amp; more';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('handles undefined input', () => {
            expect(sanitizeInput(undefined)).toBe('');
        });

        it('handles empty string', () => {
            expect(sanitizeInput('')).toBe('');
        });

        it('does not alter safe strings', () => {
            const input = 'Hello World 123';
            expect(sanitizeInput(input)).toBe(input);
        });
    });

    describe('redactMobile', () => {
        it('redacts valid mobile number', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
        });

        it('handles short numbers', () => {
            expect(redactMobile('123')).toBe('***');
        });

        it('handles null/undefined', () => {
            expect(redactMobile(null)).toBe('[MISSING]');
        });
    });

    describe('redactEmail', () => {
        it('redacts valid email', () => {
            expect(redactEmail('john.doe@example.com')).toBe('jo***@example.com');
        });
        it('redacts short email local part', () => {
            expect(redactEmail('me@example.com')).toBe('***@example.com');
        });
        it('handles invalid email', () => {
             expect(redactEmail('invalid-email')).toBe('[INVALID_EMAIL]');
        });
    });

    describe('redactToken', () => {
        it('redacts long token', () => {
            expect(redactToken('abcdef1234567890')).toBe('abcd...7890');
        });
        it('handles short token', () => {
            expect(redactToken('short')).toBe('***');
        });
    });
});
