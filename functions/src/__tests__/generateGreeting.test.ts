/**
 * @file generateGreeting.test.ts
 * @description TDD Tests for the generateGreeting Cloud Function
 * 
 * RED Phase: These tests are written BEFORE the implementation.
 * They should FAIL until we implement generateGreeting in src/index.ts
 */

import { generateGreetingMessage, GreetingRequest, _buildPromptForTest } from '../greeting';

describe('generateGreetingMessage', () => {
    describe('Input Validation', () => {
        it('throws error when name is missing', async () => {
            const request: GreetingRequest = {
                name: '',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };

            await expect(generateGreetingMessage(request)).rejects.toThrow(
                'Name is required'
            );
        });

        it('throws error when type is invalid', async () => {
            const request = {
                name: 'John',
                type: 'INVALID',
                language: 'ENGLISH',
            } as unknown as GreetingRequest;

            await expect(generateGreetingMessage(request)).rejects.toThrow(
                'Invalid type'
            );
        });

        it('throws error when language is invalid', async () => {
            const request = {
                name: 'John',
                type: 'BIRTHDAY',
                language: 'FRENCH',
            } as unknown as GreetingRequest;

            await expect(generateGreetingMessage(request)).rejects.toThrow(
                'Invalid language'
            );
        });
    });

    describe('Greeting Generation', () => {
        it('returns a greeting message containing the name', async () => {
            const request: GreetingRequest = {
                name: 'Rahul',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };

            const result = await generateGreetingMessage(request);

            expect(result).toContain('Rahul');
            expect(result.length).toBeGreaterThan(10);
        });

        it('returns birthday-specific message for BIRTHDAY type', async () => {
            const request: GreetingRequest = {
                name: 'Priya',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };

            const result = await generateGreetingMessage(request);

            // Should contain birthday-related words
            expect(result.toLowerCase()).toMatch(/birthday|birth|born/);
        });

        it('returns anniversary-specific message for ANNIVERSARY type', async () => {
            const request: GreetingRequest = {
                name: 'Kumar',
                type: 'ANNIVERSARY',
                language: 'ENGLISH',
            };

            const result = await generateGreetingMessage(request);

            // Should contain anniversary-related words
            expect(result.toLowerCase()).toMatch(/anniversary|wedding|years/);
        });

        it('returns message in ODIA when language is ODIA', async () => {
            const request: GreetingRequest = {
                name: 'Sanjay',
                type: 'BIRTHDAY',
                language: 'ODIA',
            };

            const result = await generateGreetingMessage(request);

            // Odia text uses specific Unicode range
            expect(result).toMatch(/[\u0B00-\u0B7F]/);
        });

        it('returns message in HINDI when language is HINDI', async () => {
            const request: GreetingRequest = {
                name: 'Amit',
                type: 'BIRTHDAY',
                language: 'HINDI',
            };

            const result = await generateGreetingMessage(request);

            // Hindi/Devanagari uses specific Unicode range
            expect(result).toMatch(/[\u0900-\u097F]/);
        });
    });

    describe('Edge Cases', () => {
        it('handles very long names gracefully', async () => {
            const request: GreetingRequest = {
                name: 'Shri Pranab Kumar Balabantaray Ji',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };

            const result = await generateGreetingMessage(request);

            expect(result).toBeDefined();
            expect(result.length).toBeLessThan(500); // Should be concise
        });

        it('handles names with special characters', async () => {
            const request: GreetingRequest = {
                name: "O'Brien",
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };

            const result = await generateGreetingMessage(request);

            // Note: In template fallback, it just replaces {name}, so it might contain O'Brien or O&apos;Brien depending on implementation details of fallback.
            // But since getTemplateMessage just does .replace, it uses the original string from request if we didn't sanitize request.name before passing to getTemplateMessage.
            // Wait, I updated generateGreetingMessage to use sanitizeInput ONLY in buildPrompt.
            // So getTemplateMessage still uses request.name (raw).
            // That is fine for templates as they are just string replacements in JS code, not AI prompts.
            // Although XSS might be an issue if the result is rendered HTML without escaping.
            // But this test expects "O'Brien".
            expect(result).toContain("O'Brien");
        });
    });

    describe('Prompt Security', () => {
        it('sanitizes input in the prompt', () => {
            const request: GreetingRequest = {
                name: '<script>evil</script>',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
                leaderName: 'Hack"er'
            };

            const prompt = _buildPromptForTest(request);

            expect(prompt).toContain('&lt;script&gt;evil&lt;/script&gt;');
            expect(prompt).toContain('Hack&quot;er');
            expect(prompt).not.toContain('<script>');
        });

        it('uses XML delimiters', () => {
            const request: GreetingRequest = {
                name: 'John',
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            };

            const prompt = _buildPromptForTest(request);

            expect(prompt).toContain('<instructions>');
            expect(prompt).toContain('</instructions>');
            expect(prompt).toContain('<constituent_name>John</constituent_name>');
        });
    });
});
