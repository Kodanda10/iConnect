"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const security_1 = require("../utils/security");
describe('Security Utils', () => {
    describe('redactMobile', () => {
        it('should redact valid mobile numbers', () => {
            expect((0, security_1.redactMobile)('+919876543210')).toBe('*********3210');
            expect((0, security_1.redactMobile)('9876543210')).toBe('******3210');
        });
        it('should handle short numbers', () => {
            expect((0, security_1.redactMobile)('123')).toBe('***');
        });
        it('should handle null/undefined', () => {
            expect((0, security_1.redactMobile)(null)).toBe('[MISSING]');
            expect((0, security_1.redactMobile)(undefined)).toBe('[MISSING]');
        });
    });
    describe('redactTitle', () => {
        it('should redact meeting titles', () => {
            expect((0, security_1.redactTitle)('Meeting with Client X')).toBe('Mee...');
            expect((0, security_1.redactTitle)('Performance Review')).toBe('Per...');
        });
        it('should keep short titles', () => {
            expect((0, security_1.redactTitle)('Hi')).toBe('Hi');
            expect((0, security_1.redactTitle)('ABC')).toBe('ABC');
        });
        it('should handle null/undefined', () => {
            expect((0, security_1.redactTitle)(null)).toBe('[MISSING]');
            expect((0, security_1.redactTitle)(undefined)).toBe('[MISSING]');
        });
    });
});
//# sourceMappingURL=security.test.js.map