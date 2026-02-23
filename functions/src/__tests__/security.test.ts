import { sanitizeInput } from '../utils/security';

describe('Security Utils', () => {
    describe('sanitizeInput', () => {
        it('should return empty string for null/undefined/empty input', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
            expect(sanitizeInput('')).toBe('');
        });

        it('should escape HTML special characters', () => {
            const input = '<script>alert("XSS")</script>';
            const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should escape single quotes', () => {
            const input = "It's a test";
            const expected = "It&#039;s a test";
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should escape ampersands', () => {
            const input = "Tom & Jerry";
            const expected = "Tom &amp; Jerry";
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle strings without special characters', () => {
            const input = "Hello World";
            expect(sanitizeInput(input)).toBe(input);
        });
    });
});
