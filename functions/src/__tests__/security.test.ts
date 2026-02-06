import { redactTitle, redactMobile } from '../utils/security';

describe('Security Utils', () => {
    describe('redactTitle', () => {
        it('should redact valid titles', () => {
            expect(redactTitle('Meeting with Boss')).toBe('[REDACTED]');
            expect(redactTitle('Secret Project')).toBe('[REDACTED]');
        });

        it('should handle empty or missing titles', () => {
            expect(redactTitle(null)).toBe('[MISSING]');
            expect(redactTitle(undefined)).toBe('[MISSING]');
            expect(redactTitle('')).toBe('[MISSING]');
        });
    });

    describe('redactMobile', () => {
        it('should redact mobile numbers', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
            expect(redactMobile('1234567890')).toBe('******7890');
        });

        it('should handle short numbers', () => {
            expect(redactMobile('123')).toBe('***');
        });

        it('should handle missing numbers', () => {
            expect(redactMobile(null)).toBe('[MISSING]');
        });
    });
});
