import { sanitizeInput, redactMobile, redactEmail } from '../utils/security';

describe('Security Utils', () => {
    describe('sanitizeInput', () => {
        it('should escape special XML characters', () => {
            const input = '<script>alert("xss")&</script>';
            const expected = '&lt;script&gt;alert(&quot;xss&quot;)&amp;&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle single quotes', () => {
            const input = "O'Connor";
            const expected = "O&apos;Connor";
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should return empty string for null/undefined/empty input', () => {
            expect(sanitizeInput('')).toBe('');
            // @ts-ignore
            expect(sanitizeInput(null)).toBe('');
            // @ts-ignore
            expect(sanitizeInput(undefined)).toBe('');
        });
    });

    describe('redactMobile', () => {
        it('should redact valid mobile numbers', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
            expect(redactMobile('9876543210')).toBe('******3210');
        });

        it('should handle short numbers', () => {
            expect(redactMobile('123')).toBe('***');
        });

        it('should handle missing input', () => {
            expect(redactMobile(null)).toBe('[MISSING]');
            expect(redactMobile(undefined)).toBe('[MISSING]');
        });
    });

    // Brief check for other utilities
    describe('redactEmail', () => {
        it('should redact email local part', () => {
            expect(redactEmail('john.doe@example.com')).toBe('jo***@example.com');
            expect(redactEmail('me@test.com')).toBe('***@test.com');
        });
    });
});
