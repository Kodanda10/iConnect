
import { redactMobile, redactMessage, redactEmail, redactToken } from '../utils/security';

describe('Security Utilities', () => {
    describe('redactMobile', () => {
        it('should redact valid mobile numbers', () => {
            // +911234567890 has 13 characters. 13-4 = 9 stars.
            expect(redactMobile('+911234567890')).toBe('*********7890');
            expect(redactMobile('1234567890')).toBe('******7890');
        });

        it('should handle short numbers', () => {
            expect(redactMobile('123')).toBe('****');
            expect(redactMobile('')).toBe('****');
        });
    });

    describe('redactMessage', () => {
        it('should redact message content', () => {
            expect(redactMessage('Hello World')).toBe('[REDACTED CONTENT: 11 chars]');
        });

        it('should handle empty messages', () => {
            expect(redactMessage('')).toBe('[EMPTY]');
        });
    });

    describe('redactEmail', () => {
        it('should redact email username', () => {
            expect(redactEmail('john.doe@example.com')).toBe('j***@example.com');
        });

        it('should handle short usernames', () => {
            expect(redactEmail('a@b.com')).toBe('*@b.com');
        });

        it('should handle invalid emails', () => {
            expect(redactEmail('invalid-email')).toBe('[INVALID EMAIL]');
        });
    });

    describe('redactToken', () => {
        it('should redact long tokens', () => {
            expect(redactToken('abcdef123456')).toBe('ab...[12 chars]');
        });

        it('should handle short tokens', () => {
            expect(redactToken('1234')).toBe('***');
        });

        it('should handle empty tokens', () => {
            expect(redactToken('')).toBe('[EMPTY]');
        });
    });
});
