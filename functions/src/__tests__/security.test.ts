import { sanitizeInput, redactMobile, redactToken } from '../utils/security';

describe('Security Utils', () => {
    describe('sanitizeInput', () => {
        it('should return empty string for null or undefined', () => {
            expect(sanitizeInput('')).toBe('');
            // @ts-ignore
            expect(sanitizeInput(null as any)).toBe('');
            // @ts-ignore
            expect(sanitizeInput(undefined as any)).toBe('');
        });

        it('should trim whitespace', () => {
            expect(sanitizeInput('  hello  ')).toBe('hello');
        });

        it('should escape XML special characters', () => {
            const input = '<script>alert("xss")</script>';
            const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should escape ampersands', () => {
            expect(sanitizeInput('Tom & Jerry')).toBe('Tom &amp; Jerry');
        });

        it('should escape quotes', () => {
            expect(sanitizeInput("O'Reilly")).toBe('O&apos;Reilly');
        });

        it('should limit length', () => {
            const longString = 'a'.repeat(200);
            const sanitized = sanitizeInput(longString, 10);
            expect(sanitized.length).toBe(10);
            expect(sanitized).toBe('aaaaaaaaaa');
        });

        it('should handle mixed content', () => {
            const input = 'Hello <World>';
            expect(sanitizeInput(input)).toBe('Hello &lt;World&gt;');
        });
    });

    describe('redactMobile', () => {
        it('should redact mobile number', () => {
            expect(redactMobile('1234567890')).toBe('******7890');
        });
    });

    describe('redactToken', () => {
        it('should redact token', () => {
            expect(redactToken('abcdefgh12345678')).toBe('abcd...5678');
        });
    });
});
