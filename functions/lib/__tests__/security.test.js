"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const security_1 = require("../utils/security");
describe('Security Utils', () => {
    describe('sanitizeInput', () => {
        it('should return empty string for null/undefined', () => {
            expect((0, security_1.sanitizeInput)(null)).toBe('');
            expect((0, security_1.sanitizeInput)(undefined)).toBe('');
        });
        it('should return original string if safe', () => {
            expect((0, security_1.sanitizeInput)('Safe Name')).toBe('Safe Name');
        });
        it('should remove XML tags', () => {
            expect((0, security_1.sanitizeInput)('Name <script>alert(1)</script>')).toBe('Name alert(1)');
            expect((0, security_1.sanitizeInput)('<name>Test</name>')).toBe('Test');
        });
        it('should truncate long input', () => {
            const longString = 'a'.repeat(150);
            expect((0, security_1.sanitizeInput)(longString).length).toBe(100);
        });
    });
    describe('redactMobile', () => {
        it('should redact correctly', () => {
            expect((0, security_1.redactMobile)('+919876543210')).toBe('*********3210');
        });
    });
});
//# sourceMappingURL=security.test.js.map