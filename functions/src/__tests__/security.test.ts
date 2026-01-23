
import { redactMobile, redactMessage, redactEmail, redactToken, redactText } from '../utils/security';

describe('Security Utils', () => {
    describe('redactMobile', () => {
        it('should redact mobile number', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
            expect(redactMobile('1234567890')).toBe('******7890');
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
        it('should redact message', () => {
            const longMsg = 'This is a very long message that should be redacted';
            expect(redactMessage(longMsg)).toContain('[51 chars]');
            expect(redactMessage(longMsg)).toContain('This is a ...'); // preview 10 chars
        });

        it('should handle missing input', () => {
             expect(redactMessage(null)).toBe('[EMPTY]');
        });
    });

    describe('redactEmail', () => {
        it('should redact email', () => {
            expect(redactEmail('john.doe@example.com')).toBe('jo***@example.com');
            expect(redactEmail('ab@test.com')).toBe('***@test.com');
        });

        it('should handle invalid email', () => {
             expect(redactEmail('invalid-email')).toBe('[INVALID_EMAIL]');
        });
    });

    describe('redactToken', () => {
        it('should redact token', () => {
            expect(redactToken('abcdef1234567890')).toBe('abcd...7890');
        });

         it('should handle short token', () => {
            expect(redactToken('abc')).toBe('***');
        });
    });

    describe('redactText', () => {
        it('should redact generic text', () => {
            // Default 3 chars
            expect(redactText('Secret Meeting Title')).toBe('Sec... [20 chars]');
        });

        it('should handle short text (<= visible chars)', () => {
             // If length is <= 3, show it
             expect(redactText('Hi')).toBe('Hi');
             expect(redactText('Hey')).toBe('Hey');
        });

        it('should allow custom visible length', () => {
             expect(redactText('Secret', 1)).toBe('S... [6 chars]');
        });

        it('should handle empty/missing', () => {
            expect(redactText(null)).toBe('[EMPTY]');
            expect(redactText('')).toBe('[EMPTY]');
        });
    });
});
