import { sanitizeInput } from '../utils/security';

describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        it('should return empty string for null or undefined', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
            expect(sanitizeInput('')).toBe('');
        });

        it('should strip HTML tags', () => {
            expect(sanitizeInput('<h1>Hello</h1> World')).toBe('Hello World');
            expect(sanitizeInput('<script>alert("XSS")</script>')).toBe('alert("XSS")');
        });

        it('should strip standalone angle brackets', () => {
            expect(sanitizeInput('Value < 10')).toBe('Value  10');
            expect(sanitizeInput('Value > 5')).toBe('Value  5');
        });

        it('should strip control characters', () => {
            const inputWithControlChars = 'Hello\x00\x1F\x7FWorld';
            expect(sanitizeInput(inputWithControlChars)).toBe('HelloWorld');
        });

        it('should limit input length to 100 characters', () => {
            const longInput = 'a'.repeat(150);
            expect(sanitizeInput(longInput)).toHaveLength(100);
            expect(sanitizeInput(longInput)).toBe('a'.repeat(100));
        });

        it('should trim whitespace', () => {
            expect(sanitizeInput('   Hello World   ')).toBe('Hello World');
        });

        it('should handle input completely stripped by sanitization', () => {
            expect(sanitizeInput('<><><>')).toBe('');
            expect(sanitizeInput('\x00\x00\x00')).toBe('');
        });
    });
});
