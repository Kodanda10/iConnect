import { sanitizeInput } from '../utils/security';

describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        it('should return empty string for null/undefined', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
        });

        it('should return plain text as is', () => {
            expect(sanitizeInput('Hello World')).toBe('Hello World');
        });

        it('should escape XML special characters', () => {
            const input = '<script>alert("XSS") & \'test\'</script>';
            const expected = '&lt;script&gt;alert(&quot;XSS&quot;) &amp; &apos;test&apos;&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });
    });
});
