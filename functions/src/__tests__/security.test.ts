import { redactMobile, redactMessage, redactEmail, redactToken, redactTitle } from '../utils/security';

describe('Security Utilities', () => {
    describe('redactMobile', () => {
        it('redacts valid mobile numbers', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
            expect(redactMobile('12345')).toBe('*2345');
        });

        it('handles short or empty values', () => {
            expect(redactMobile('123')).toBe('***');
            expect(redactMobile('')).toBe('[MISSING]');
            expect(redactMobile(null)).toBe('[MISSING]');
        });
    });

    describe('redactMessage', () => {
        it('redacts message content but shows length', () => {
            const msg = 'This is a secret message';
            const redacted = redactMessage(msg);
            expect(redacted).toContain(`[${msg.length} chars]`);
            expect(redacted).toContain('This is a ...');
        });

        it('handles empty messages', () => {
            expect(redactMessage(null)).toBe('[EMPTY]');
        });
    });

    describe('redactEmail', () => {
        it('redacts email local part', () => {
            expect(redactEmail('john.doe@example.com')).toBe('jo***@example.com');
            expect(redactEmail('ab@example.com')).toBe('***@example.com');
        });

        it('handles invalid emails', () => {
            expect(redactEmail('invalid-email')).toBe('[INVALID_EMAIL]');
            expect(redactEmail(null)).toBe('[MISSING]');
        });
    });

    describe('redactToken', () => {
        it('redacts long tokens', () => {
            expect(redactToken('abcdef1234567890')).toBe('abcd...7890');
        });

        it('handles short tokens', () => {
            expect(redactToken('short')).toBe('***');
            expect(redactToken(null)).toBe('[MISSING]');
        });
    });

    describe('redactTitle', () => {
        it('redacts title content but shows length and preview', () => {
            const title = 'Meeting with John Doe';
            const redacted = redactTitle(title);
            expect(redacted).toContain(`[${title.length} chars]`);
            expect(redacted).toContain('Meeti...');
        });

        it('returns short titles as is', () => {
            expect(redactTitle('Hi')).toBe('Hi');
            expect(redactTitle('ABC')).toBe('ABC');
        });

        it('handles empty titles', () => {
            expect(redactTitle(null)).toBe('[MISSING]');
        });
    });
});
