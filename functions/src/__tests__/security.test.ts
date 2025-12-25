import { redactMobile, redactMessage, redactObject } from '../utils/security';

describe('Security Utils', () => {
    describe('redactMobile', () => {
        it('should redact standard 10 digit numbers', () => {
            expect(redactMobile('9876543210')).toBe('****** 3210');
        });

        it('should redact numbers with country code', () => {
            expect(redactMobile('+919876543210')).toBe('+91 ****** 3210');
        });

        it('should handle short numbers safely', () => {
            expect(redactMobile('123')).toBe('***');
            expect(redactMobile('12345')).toBe('***45');
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

    describe('redactObject', () => {
        it('should show keys only', () => {
            const obj = { name: 'Alice', phone: '123' };
            expect(redactObject(obj)).toBe('[REDACTED_OBJ] Keys: name, phone');
        });
    });
});
