import { sanitizeInput } from '../utils/security';

describe('security utils', () => {
    describe('sanitizeInput', () => {
        it('should truncate input to 100 characters', () => {
            const longInput = 'a'.repeat(150);
            const result = sanitizeInput(longInput, 'fallback');
            expect(result.length).toBe(100);
            expect(result).toBe('a'.repeat(100));
        });

        it('should strip HTML tags completely', () => {
            const input = '<script>alert("xss")</script>Hello <b>World</b>!';
            const result = sanitizeInput(input, 'fallback');
            expect(result).toBe('alert("xss")Hello World!');
        });

        it('should strip standalone angle brackets', () => {
            const input = 'a < b and c > d';
            const result = sanitizeInput(input, 'fallback');
            // 'a < b and c > d' will have `< b and c >` stripped by the `/<[^>]*>/g` regex
            // leaving 'a  d'
            expect(result).toBe('a  d');
        });

        it('should strip control characters', () => {
            const input = 'Hello\x00World\x1F!';
            const result = sanitizeInput(input, 'fallback');
            expect(result).toBe('HelloWorld!');
        });

        it('should return fallback if input is completely empty after stripping', () => {
            const input = '<script></script><>';
            const result = sanitizeInput(input, 'fallback');
            expect(result).toBe('fallback');
        });

        it('should return fallback if input is null or undefined', () => {
            expect(sanitizeInput(null, 'fallback')).toBe('fallback');
            expect(sanitizeInput(undefined, 'fallback')).toBe('fallback');
        });

        it('should preserve valid text characters', () => {
            const input = 'Normal constituent name';
            const result = sanitizeInput(input, 'fallback');
            expect(result).toBe('Normal constituent name');
        });

        it('should trim whitespace', () => {
            const input = '   Name   ';
            const result = sanitizeInput(input, 'fallback');
            expect(result).toBe('Name');
        });
    });
});