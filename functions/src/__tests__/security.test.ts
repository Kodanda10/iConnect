
import { sanitizeInput, redactMobile, redactToken } from '../utils/security';

describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        it('should escape special characters', () => {
            const input = '<script>alert("xss")</script>';
            const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle empty input', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
            expect(sanitizeInput('')).toBe('');
        });

        it('should escape ampersands', () => {
            expect(sanitizeInput('Fish & Chips')).toBe('Fish &amp; Chips');
        });
    });

    describe('redactMobile', () => {
        it('should redact mobile numbers', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
        });
    });

    describe('redactToken', () => {
        it('should redact tokens', () => {
            expect(redactToken('abcdef1234567890')).toBe('abcd...7890');
        });
    });
});
