import { sanitizeInput, redactMobile } from '../utils/security';

describe('Security Utils', () => {
    describe('sanitizeInput', () => {
        it('should return empty string for null/undefined', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
        });

        it('should return original string if safe', () => {
            expect(sanitizeInput('Safe Name')).toBe('Safe Name');
        });

        it('should remove XML tags', () => {
            expect(sanitizeInput('Name <script>alert(1)</script>')).toBe('Name alert(1)');
            expect(sanitizeInput('<name>Test</name>')).toBe('Test');
        });

        it('should truncate long input', () => {
            const longString = 'a'.repeat(150);
            expect(sanitizeInput(longString).length).toBe(100);
        });
    });

    describe('redactMobile', () => {
        it('should redact correctly', () => {
             expect(redactMobile('+919876543210')).toBe('*********3210');
        });
    });
});
