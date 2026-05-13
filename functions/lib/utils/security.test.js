"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const security_1 = require("./security");
describe('Security Utilities', () => {
    describe('redactMobile', () => {
        it('redacts mobile numbers correctly', () => {
            expect((0, security_1.redactMobile)('+919876543210')).toBe('*********3210');
            expect((0, security_1.redactMobile)('123')).toBe('***');
            expect((0, security_1.redactMobile)(null)).toBe('[MISSING]');
        });
    });
    describe('sanitizeInput', () => {
        it('limits length to 100 characters', () => {
            const longInput = 'a'.repeat(150);
            const sanitized = (0, security_1.sanitizeInput)(longInput);
            expect(sanitized.length).toBe(100);
            expect(sanitized).toBe('a'.repeat(100));
        });
        it('aggressively removes HTML tags', () => {
            expect((0, security_1.sanitizeInput)('Hello <b>World</b>!')).toBe('Hello World!');
            expect((0, security_1.sanitizeInput)('<script>alert("xss")</script>')).toBe('alert("xss")');
        });
        it('removes standalone angle brackets', () => {
            expect((0, security_1.sanitizeInput)('Value < 10 and Value > 5')).toBe('Value  5');
        });
        it('removes control characters', () => {
            const inputWithControl = 'Hello\x00\x1FWorld';
            expect((0, security_1.sanitizeInput)(inputWithControl)).toBe('HelloWorld');
        });
        it('handles null or undefined gracefully', () => {
            expect((0, security_1.sanitizeInput)(null)).toBe('');
            expect((0, security_1.sanitizeInput)(undefined)).toBe('');
            expect((0, security_1.sanitizeInput)('')).toBe('');
        });
    });
});
//# sourceMappingURL=security.test.js.map