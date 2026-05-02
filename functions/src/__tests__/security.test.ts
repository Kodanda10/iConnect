import { sanitizeInput } from '../utils/security';

describe('security utils', () => {
    describe('sanitizeInput', () => {
        it('returns empty string for null or undefined', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
            expect(sanitizeInput('')).toBe('');
        });

        it('limits length to 100 characters', () => {
            const longInput = 'a'.repeat(150);
            const sanitized = sanitizeInput(longInput);
            expect(sanitized.length).toBe(100);
            expect(sanitized).toBe('a'.repeat(100));
        });

        it('aggressively removes HTML tags', () => {
            expect(sanitizeInput('<script>alert(1)</script>')).toBe('alert(1)');
            expect(sanitizeInput('<b>bold</b> text')).toBe('bold text');
            expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('');
        });

        it('removes standalone angle brackets', () => {
            expect(sanitizeInput('Value < 10 and Value > 5')).toBe('Value  5');
            expect(sanitizeInput('<>')).toBe('');
        });

        it('removes control characters', () => {
            expect(sanitizeInput('hello\x00world')).toBe('helloworld');
            expect(sanitizeInput('test\x1Ftest')).toBe('testtest');
            expect(sanitizeInput('data\x7F')).toBe('data');
        });

        it('preserves normal text', () => {
            const text = 'Hello, world! 123 @#$';
            expect(sanitizeInput(text)).toBe(text);
        });
    });
});
