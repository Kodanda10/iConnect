import { redactMobile, redactMessage, redactEmail, redactToken, sanitizeInput } from '../utils/security';

describe('Security Utils', () => {
    describe('redactMobile', () => {
        it('should redact valid mobile numbers', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
            expect(redactMobile('1234')).toBe('1234');
        });

        it('should handle short numbers', () => {
            expect(redactMobile('123')).toBe('***');
        });

        it('should handle null/undefined', () => {
            expect(redactMobile(null)).toBe('[MISSING]');
            expect(redactMobile(undefined)).toBe('[MISSING]');
        });
    });

    describe('redactMessage', () => {
        it('should redact message content', () => {
            const msg = 'Hello World This Is A Long Message';
            expect(redactMessage(msg)).toBe(`[${msg.length} chars] Hello Worl...`);
        });

        it('should handle empty/null', () => {
            expect(redactMessage('')).toBe('[EMPTY]');
            expect(redactMessage(null)).toBe('[EMPTY]');
        });
    });

    describe('redactEmail', () => {
        it('should redact email addresses', () => {
            expect(redactEmail('john.doe@example.com')).toBe('jo***@example.com');
            expect(redactEmail('me@test.com')).toBe('***@test.com');
        });

        it('should handle invalid emails', () => {
            expect(redactEmail('invalid-email')).toBe('[INVALID_EMAIL]');
        });

        it('should handle null/undefined', () => {
            expect(redactEmail(null)).toBe('[MISSING]');
        });
    });

    describe('redactToken', () => {
        it('should redact tokens', () => {
            expect(redactToken('abcdefgh12345678')).toBe('abcd...5678');
        });

        it('should handle short tokens', () => {
            expect(redactToken('short')).toBe('***');
        });

        it('should handle null/undefined', () => {
            expect(redactToken(null)).toBe('[MISSING]');
        });
    });

    describe('sanitizeInput', () => {
        it('should escape XML special characters', () => {
            expect(sanitizeInput('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
            expect(sanitizeInput('User & Co')).toBe('User &amp; Co');
            expect(sanitizeInput("O'Connor")).toBe('O&#039;Connor');
        });

        it('should handle null/undefined', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
        });

        it('should return safe string as is', () => {
            expect(sanitizeInput('Safe String 123')).toBe('Safe String 123');
        });
    });
});
