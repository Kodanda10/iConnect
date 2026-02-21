import { sanitizeInput } from '../utils/security';

describe('Security Utils', () => {
    describe('sanitizeInput', () => {
        it('should return empty string for empty input', () => {
            expect(sanitizeInput('')).toBe('');
        });

        it('should return the same string for alphanumeric input', () => {
            expect(sanitizeInput('Hello World')).toBe('Hello World');
        });

        it('should escape HTML special characters', () => {
            expect(sanitizeInput('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        });

        it('should escape ampersands', () => {
            expect(sanitizeInput('Fish & Chips')).toBe('Fish &amp; Chips');
        });

        it('should escape single quotes', () => {
            expect(sanitizeInput("It's a test")).toBe('It&apos;s a test');
        });

        it('should handle mixed content', () => {
            const input = 'Hello <User> & "Friends"';
            const expected = 'Hello &lt;User&gt; &amp; &quot;Friends&quot;';
            expect(sanitizeInput(input)).toBe(expected);
        });
    });
});
