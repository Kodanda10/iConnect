import { sanitizeInput } from '../utils/security';

describe('security utils', () => {
    describe('sanitizeInput', () => {
        test('removes HTML tags but preserves inner text', () => {
            const input = '<script>alert("hacked")</script>';
            const result = sanitizeInput(input);
            expect(result).toBe('alert("hacked")');
        });

        test('handles nested tags', () => {
            const input = '<div><p>Hello <b>World</b></p></div>';
            const result = sanitizeInput(input);
            expect(result).toBe('Hello World');
        });

        test('removes control characters', () => {
            const input = 'Hello\x00World\x08';
            const result = sanitizeInput(input);
            expect(result).toBe('HelloWorld');
        });

        test('returns empty string for null or undefined', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
        });

        test('handles inputs that are completely stripped', () => {
            const input = '<script></script>';
            const result = sanitizeInput(input);
            expect(result).toBe('');
        });

        test('trims whitespace', () => {
            const input = '  Hello World  ';
            const result = sanitizeInput(input);
            expect(result).toBe('Hello World');
        });
    });
});
