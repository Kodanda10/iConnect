import { sanitizeInput } from '../utils/security';

describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        it('should return empty string for null or undefined', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
        });

        it('should escape HTML special characters', () => {
            const input = '<script>alert("xss")</script>';
            const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should escape ampersands', () => {
            const input = 'Tom & Jerry';
            const expected = 'Tom &amp; Jerry';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should escape single quotes', () => {
            const input = "It's a test";
            const expected = "It&apos;s a test";
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle mixed characters', () => {
            const input = '<div class="test">Bob\'s & Alice\'s</div>';
            const expected = '&lt;div class=&quot;test&quot;&gt;Bob&apos;s &amp; Alice&apos;s&lt;/div&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should return original string if no special characters', () => {
            const input = 'Hello World 123';
            expect(sanitizeInput(input)).toBe(input);
        });
    });
});
