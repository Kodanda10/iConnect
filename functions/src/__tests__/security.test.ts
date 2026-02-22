/**
 * @file security.test.ts
 * @description Tests for security utilities and hardening measures
 */

import { sanitizeInput, redactMobile, redactEmail } from '../utils/security';
import { generateGreetingMessage, GreetingRequest } from '../greeting';

describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        it('should escape XML/HTML special characters', () => {
            const input = '<script>alert("xss")</script>';
            const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle ampersands correctly', () => {
            const input = 'Tom & Jerry';
            const expected = 'Tom &amp; Jerry';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle mixed characters', () => {
            const input = 'O\'Neil says "Hello" <world>';
            const expected = 'O&apos;Neil says &quot;Hello&quot; &lt;world&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should return empty string for null/undefined input', () => {
            expect(sanitizeInput(null as any)).toBe('');
            expect(sanitizeInput(undefined as any)).toBe('');
            expect(sanitizeInput('')).toBe('');
        });
    });

    describe('Redaction Utilities', () => {
        it('should redact mobile numbers', () => {
            expect(redactMobile('+919876543210')).toBe('*********3210');
            expect(redactMobile('123')).toBe('***');
        });

        it('should redact email addresses', () => {
            expect(redactEmail('john.doe@example.com')).toBe('jo***@example.com');
            expect(redactEmail('me@test.com')).toBe('***@test.com');
        });
    });
});

describe('Greeting Security', () => {
    describe('Input Validation & Sanitization', () => {
        it('should truncate very long names to prevent DoS', async () => {
            const longName = 'A'.repeat(200);
            const request: GreetingRequest = {
                name: longName,
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };

            const result = await generateGreetingMessage(request);

            // Since we don't have API key, it falls back to template
            // Template should use the truncated name
            expect(result.length).toBeLessThan(longName.length);
            expect(result).toContain('A'.repeat(100));
            expect(result).not.toContain('A'.repeat(101));
        });

        it('should handle malicious input gracefully (fallback to template)', async () => {
            const maliciousName = '<script>alert(1)</script>';
            const request: GreetingRequest = {
                name: maliciousName,
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };

            const result = await generateGreetingMessage(request);

            // In fallback mode, the template simply replaces {name}.
            // Note: The template replacement does NOT escape HTML entities because
            // the output is expected to be used in SMS/WhatsApp (plain text).
            // However, the *prompt construction* (which we can't easily test without mocking buildPrompt)
            // is what we secured against injection.
            // Here we just verify it doesn't crash.
            expect(result).toContain(maliciousName);
        });
    });
});
