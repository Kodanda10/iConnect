
import { redactMobile, redactMessage, redactEmail, redactToken, sanitizeInput } from '../utils/security';

describe('Security Utilities', () => {
    describe('redactMobile', () => {
        it('should redact valid mobile number', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
        });

        it('should handle short numbers', () => {
            expect(redactMobile('123')).toBe('***');
        });

        it('should handle missing input', () => {
            expect(redactMobile(null)).toBe('[MISSING]');
            expect(redactMobile(undefined)).toBe('[MISSING]');
        });
    });

    describe('redactMessage', () => {
        it('should redact message content', () => {
            const msg = 'This is a secret message';
            expect(redactMessage(msg)).toContain(`[${msg.length} chars]`);
            expect(redactMessage(msg)).toContain('This is a ...');
        });

        it('should handle empty input', () => {
            expect(redactMessage(null)).toBe('[EMPTY]');
        });
    });

    describe('redactEmail', () => {
        it('should redact email local part', () => {
            expect(redactEmail('test@example.com')).toBe('te***@example.com');
        });

        it('should handle short local part', () => {
            expect(redactEmail('me@example.com')).toBe('***@example.com');
        });

        it('should handle invalid email', () => {
            expect(redactEmail('invalid-email')).toBe('[INVALID_EMAIL]');
        });
    });

    describe('redactToken', () => {
        it('should redact long token', () => {
            expect(redactToken('abcdef1234567890')).toBe('abcd...7890');
        });

        it('should handle short token', () => {
            expect(redactToken('short')).toBe('***');
        });
    });

    describe('sanitizeInput', () => {
        it('should escape XML special characters', () => {
            const input = '<script>alert("xss") & \'test\'</script>';
            const expected = '&lt;script&gt;alert(&quot;xss&quot;) &amp; &apos;test&apos;&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle empty input', () => {
            expect(sanitizeInput(undefined)).toBe('');
            expect(sanitizeInput('')).toBe('');
        });

        it('should handle normal text without changes', () => {
            const input = 'Hello World';
            expect(sanitizeInput(input)).toBe(input);
        });
    });
});
