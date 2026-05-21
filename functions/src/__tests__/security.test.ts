import { sanitizeInput } from '../utils/security';

describe('security utils', () => {
    describe('sanitizeInput', () => {
        it('should return empty string for null or undefined', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
        });

        it('should strip HTML tags', () => {
            expect(sanitizeInput('<script>alert("XSS")</script>')).toBe('alert("XSS")');
            expect(sanitizeInput('<b>Bold</b>')).toBe('Bold');
            expect(sanitizeInput('Text <img src="x" onerror="alert(1)">')).toBe('Text');
        });

        it('should handle unclosed tags or standalone angle brackets', () => {
            // Note: the aggressive tag stripper /<[^>]*>/g will match from the first < to the last >
            // So 'Value < 10 and Value > 5' will have everything between < and > stripped
            expect(sanitizeInput('Value < 10 and Value > 5')).toBe('Value  5');
            expect(sanitizeInput('<<<')).toBe('');
        });

        it('should remove control characters', () => {
            // Inject null byte and escape character
            expect(sanitizeInput('Hello\x00World\x1B')).toBe('HelloWorld');
        });

        it('should limit length to 100 characters', () => {
            const longInput = 'A'.repeat(150);
            expect(sanitizeInput(longInput)).toBe('A'.repeat(100));
        });

        it('should trim whitespace', () => {
            expect(sanitizeInput('   Hello World   ')).toBe('Hello World');
        });
    });
});
