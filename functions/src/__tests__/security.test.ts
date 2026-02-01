import { sanitizeInput, redactMobile, redactEmail, redactMessage, redactToken } from '../utils/security';

describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        it('should escape XML special characters', () => {
            const input = '<script>alert("xss")&</script>';
            const expected = '&lt;script&gt;alert(&quot;xss&quot;)&amp;&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should return empty string for null/undefined/empty input', () => {
            // @ts-ignore
            expect(sanitizeInput(null)).toBe('');
            // @ts-ignore
            expect(sanitizeInput(undefined)).toBe('');
            expect(sanitizeInput('')).toBe('');
        });

        it('should handle simple strings without changes', () => {
            expect(sanitizeInput('Hello World')).toBe('Hello World');
        });
    });

    describe('redactMobile', () => {
        it('should redact valid mobile number', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
        });

        it('should handle short numbers', () => {
            expect(redactMobile('123')).toBe('***');
        });

        it('should handle missing input', () => {
            expect(redactMobile(null)).toBe('[MISSING]');
        });
    });

    describe('redactEmail', () => {
        it('should redact valid email', () => {
            expect(redactEmail('test.user@example.com')).toBe('te***@example.com');
            expect(redactEmail('me@test.com')).toBe('***@test.com');
        });

        it('should handle invalid email', () => {
            expect(redactEmail('not-an-email')).toBe('[INVALID_EMAIL]');
        });
    });

    describe('redactMessage', () => {
        it('should redact long message', () => {
            const msg = 'This is a very long message that should be redacted';
            expect(redactMessage(msg)).toContain(`[${msg.length} chars]`);
            expect(redactMessage(msg)).toContain('This is a ...');
        });
    });

    describe('redactToken', () => {
        it('should redact token', () => {
            expect(redactToken('abcdef123456')).toBe('abcd...3456');
        });
    });
});
