
import { sanitizeInput } from '../utils/security';

describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        it('should escape HTML special characters', () => {
            const input = '<script>alert("XSS")</script>';
            const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle ampersands correctly', () => {
            const input = 'Tom & Jerry';
            const expected = 'Tom &amp; Jerry';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle single quotes', () => {
            const input = "O'Reilly";
            const expected = 'O&#39;Reilly';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle empty input', () => {
            expect(sanitizeInput('')).toBe('');
        });

        it('should handle undefined input', () => {
             // @ts-ignore
            expect(sanitizeInput(undefined)).toBe('');
        });
    });
});
