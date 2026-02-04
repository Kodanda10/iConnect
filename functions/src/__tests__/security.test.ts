
import { redactMobile, redactTitle } from '../utils/security';

describe('Security Utils', () => {
    describe('redactMobile', () => {
        it('should redact valid mobile numbers', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
            expect(redactMobile('9876543210')).toBe('******3210');
        });

        it('should handle short numbers', () => {
            expect(redactMobile('123')).toBe('***');
        });

        it('should handle null/undefined', () => {
            expect(redactMobile(null)).toBe('[MISSING]');
            expect(redactMobile(undefined)).toBe('[MISSING]');
        });
    });

    describe('redactTitle', () => {
        it('should redact meeting titles', () => {
            expect(redactTitle('Meeting with Client X')).toBe('Mee...');
            expect(redactTitle('Performance Review')).toBe('Per...');
        });

        it('should keep short titles', () => {
            expect(redactTitle('Hi')).toBe('Hi');
            expect(redactTitle('ABC')).toBe('ABC');
        });

        it('should handle null/undefined', () => {
            expect(redactTitle(null)).toBe('[MISSING]');
            expect(redactTitle(undefined)).toBe('[MISSING]');
        });
    });
});
