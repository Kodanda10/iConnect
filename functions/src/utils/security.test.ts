import { redactMobile, sanitizeInput } from './security';

describe('Security Utilities', () => {
    describe('redactMobile', () => {
        it('redacts mobile numbers correctly', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
            expect(redactMobile('123')).toBe('***');
            expect(redactMobile(null)).toBe('[MISSING]');
        });
    });

    describe('sanitizeInput', () => {
        it('limits length to 100 characters', () => {
            const longInput = 'a'.repeat(150);
            const sanitized = sanitizeInput(longInput);
            expect(sanitized.length).toBe(100);
            expect(sanitized).toBe('a'.repeat(100));
        });

        it('aggressively removes HTML tags', () => {
            expect(sanitizeInput('Hello <b>World</b>!')).toBe('Hello World!');
            expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")');
        });

        it('removes standalone angle brackets', () => {
            expect(sanitizeInput('Value < 10 and Value > 5')).toBe('Value  5');
        });

        it('removes control characters', () => {
            const inputWithControl = 'Hello\x00\x1FWorld';
            expect(sanitizeInput(inputWithControl)).toBe('HelloWorld');
        });

        it('handles null or undefined gracefully', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
            expect(sanitizeInput('')).toBe('');
        });
    });
});
