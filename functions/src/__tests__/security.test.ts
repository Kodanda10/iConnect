
import { redactText, redactMobile, redactEmail, redactToken, redactMessage } from '../utils/security';

describe('Security Utilities', () => {
    describe('redactText', () => {
        it('redacts content completely, showing only length', () => {
            expect(redactText('Secret Meeting')).toBe('[REDACTED: 14 chars]');
            expect(redactText('A')).toBe('[REDACTED: 1 chars]');
        });

        it('handles empty/null input', () => {
            expect(redactText('')).toBe('[EMPTY]');
            expect(redactText(null)).toBe('[EMPTY]');
            expect(redactText(undefined)).toBe('[EMPTY]');
        });
    });

    describe('redactMobile', () => {
        it('redacts all but last 4 digits', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
            expect(redactMobile('1234567890')).toBe('******7890');
        });

        it('handles short numbers', () => {
            expect(redactMobile('123')).toBe('***');
        });
    });

    describe('redactEmail', () => {
        it('redacts local part of email', () => {
            expect(redactEmail('john.doe@example.com')).toBe('jo***@example.com');
            expect(redactEmail('ab@example.com')).toBe('***@example.com');
        });
    });

    describe('redactToken', () => {
        it('shows first 4 and last 4 chars', () => {
            expect(redactToken('abcdef1234567890')).toBe('abcd...7890');
        });
    });

    describe('redactMessage', () => {
        it('shows length and short preview', () => {
            expect(redactMessage('Hello World')).toBe('[11 chars] Hello Worl...');
        });
    });
});
