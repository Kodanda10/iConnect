import { redactMobile, redactMessage } from '../security';

describe('Security Utils (Web)', () => {
    describe('redactMobile', () => {
        it('should redact standard 10 digit numbers', () => {
            expect(redactMobile('9876543210')).toBe('****** 3210');
        });

        it('should redact numbers with country code', () => {
            expect(redactMobile('+919876543210')).toBe('+91 ****** 3210');
        });

        it('should handle short numbers safely', () => {
            expect(redactMobile('123')).toBe('***');
        });

        it('should handle empty input', () => {
            expect(redactMobile('')).toBe('***');
        });
    });

    describe('redactMessage', () => {
        it('should show length only', () => {
            const msg = 'This is a secret message';
            expect(redactMessage(msg)).toBe(`[REDACTED] (${msg.length} chars)`);
        });

        it('should handle empty message', () => {
            expect(redactMessage('')).toBe('[EMPTY]');
        });
    });
});
