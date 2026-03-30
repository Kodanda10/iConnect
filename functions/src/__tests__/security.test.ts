import { sanitizeInput } from '../utils/security';

describe('security utilities', () => {
    describe('sanitizeInput', () => {
        it('should strip angle brackets to prevent XSS and HTML injection', () => {
            expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
            expect(sanitizeInput('John <b>Doe</b>')).toBe('John bDoe/b');
        });

        it('should limit input length to 100 characters', () => {
            const longString = 'a'.repeat(200);
            expect(sanitizeInput(longString).length).toBe(100);
            expect(sanitizeInput(longString)).toBe('a'.repeat(100));
        });

        it('should remove control characters', () => {
            expect(sanitizeInput('Hello\x00World\x1F')).toBe('HelloWorld');
        });

        it('should return empty string for null/undefined/empty input', () => {
            expect(sanitizeInput(null as any)).toBe('');
            expect(sanitizeInput(undefined as any)).toBe('');
            expect(sanitizeInput('')).toBe('');
        });

        it('should return empty string if input contains only stripped characters', () => {
            expect(sanitizeInput('<<<>>>')).toBe('');
        });

        it('should trim whitespace', () => {
            expect(sanitizeInput('   John Doe   ')).toBe('John Doe');
        });
    });
});
