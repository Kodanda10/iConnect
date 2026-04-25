"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const security_1 = require("../utils/security");
describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        it('should return empty string for null or undefined', () => {
            expect((0, security_1.sanitizeInput)(null)).toBe('');
            expect((0, security_1.sanitizeInput)(undefined)).toBe('');
            expect((0, security_1.sanitizeInput)('')).toBe('');
        });
        it('should strip HTML tags', () => {
            expect((0, security_1.sanitizeInput)('<h1>Hello</h1> World')).toBe('Hello World');
            expect((0, security_1.sanitizeInput)('<script>alert("XSS")</script>')).toBe('alert("XSS")');
        });
        it('should strip standalone angle brackets', () => {
            expect((0, security_1.sanitizeInput)('Value < 10 and Value > 5')).toBe('Value  10 and Value  5');
        });
        it('should strip control characters', () => {
            const inputWithControlChars = 'Hello\x00\x1F\x7FWorld';
            expect((0, security_1.sanitizeInput)(inputWithControlChars)).toBe('HelloWorld');
        });
        it('should limit input length to 100 characters', () => {
            const longInput = 'a'.repeat(150);
            expect((0, security_1.sanitizeInput)(longInput)).toHaveLength(100);
            expect((0, security_1.sanitizeInput)(longInput)).toBe('a'.repeat(100));
        });
        it('should trim whitespace', () => {
            expect((0, security_1.sanitizeInput)('   Hello World   ')).toBe('Hello World');
        });
        it('should handle input completely stripped by sanitization', () => {
            expect((0, security_1.sanitizeInput)('<><><>')).toBe('');
            expect((0, security_1.sanitizeInput)('\x00\x00\x00')).toBe('');
        });
    });
});
//# sourceMappingURL=security.test.js.map