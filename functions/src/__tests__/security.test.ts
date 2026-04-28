/**
 * @file functions/src/__tests__/security.test.ts
 * @description TDD tests for security utilities
 */

import { redactMobile, redactMessage, redactEmail, redactToken, sanitizeInput } from '../utils/security';

describe('security utilities', () => {
    describe('redactMobile', () => {
        it('redacts valid mobile number', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
            expect(redactMobile('9876543210')).toBe('******3210');
        });

        it('handles short numbers', () => {
            expect(redactMobile('123')).toBe('***');
        });

        it('handles missing input', () => {
            expect(redactMobile(null)).toBe('[MISSING]');
            expect(redactMobile(undefined)).toBe('[MISSING]');
            expect(redactMobile('')).toBe('[MISSING]');
        });
    });

    describe('redactMessage', () => {
        it('redacts long message', () => {
            expect(redactMessage('This is a very long message that should be redacted')).toBe('[51 chars] This is a ...');
        });

        it('redacts short message', () => {
            expect(redactMessage('Hello')).toBe('[5 chars] Hello...');
        });

        it('handles missing input', () => {
            expect(redactMessage(null)).toBe('[EMPTY]');
            expect(redactMessage(undefined)).toBe('[EMPTY]');
            expect(redactMessage('')).toBe('[EMPTY]');
        });
    });

    describe('redactEmail', () => {
        it('redacts valid email', () => {
            expect(redactEmail('testuser@example.com')).toBe('te***@example.com');
        });

        it('handles short local part', () => {
            expect(redactEmail('a@example.com')).toBe('***@example.com');
            expect(redactEmail('ab@example.com')).toBe('***@example.com');
        });

        it('handles invalid email', () => {
            expect(redactEmail('invalidemail')).toBe('[INVALID_EMAIL]');
        });

        it('handles missing input', () => {
            expect(redactEmail(null)).toBe('[MISSING]');
            expect(redactEmail(undefined)).toBe('[MISSING]');
            expect(redactEmail('')).toBe('[MISSING]');
        });
    });

    describe('redactToken', () => {
        it('redacts long token', () => {
            expect(redactToken('abcdefghijklmnopqrstuvwxyz')).toBe('abcd...wxyz');
        });

        it('handles short token', () => {
            expect(redactToken('abcde')).toBe('***');
        });

        it('handles missing input', () => {
            expect(redactToken(null)).toBe('[MISSING]');
            expect(redactToken(undefined)).toBe('[MISSING]');
            expect(redactToken('')).toBe('[MISSING]');
        });
    });

    describe('sanitizeInput', () => {
        it('allows normal text', () => {
            expect(sanitizeInput('John Doe')).toBe('John Doe');
        });

        it('trims whitespace', () => {
            expect(sanitizeInput('  John Doe  ')).toBe('John Doe');
        });

        it('truncates to 100 characters', () => {
            const longString = 'a'.repeat(150);
            expect(sanitizeInput(longString)).toBe('a'.repeat(100));
        });

        it('removes HTML tags', () => {
            expect(sanitizeInput('<script>alert("XSS")</script>')).toBe('alert("XSS")');
            expect(sanitizeInput('<b>John</b> Doe')).toBe('John Doe');
        });

        it('removes angle brackets', () => {
            expect(sanitizeInput('John < Doe >')).toBe('John'); // Note: ' < Doe >' is treated as an unclosed tag and stripped.
        });

        it('removes control characters', () => {
            expect(sanitizeInput('John\x00Doe')).toBe('JohnDoe');
            expect(sanitizeInput('John\nDoe')).toBe('John Doe'); // \n is whitespace and replaced by space.
        });

        it('handles string comprised entirely of stripped tokens', () => {
            expect(sanitizeInput('<>')).toBe('');
            expect(sanitizeInput('<script></script>')).toBe('');
        });

        it('handles missing input', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
            expect(sanitizeInput('')).toBe('');
        });
    });
});
