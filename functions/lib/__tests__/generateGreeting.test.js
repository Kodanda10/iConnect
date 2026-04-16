"use strict";
/**
 * @file generateGreeting.test.ts
 * @description TDD Tests for the generateGreeting Cloud Function
 *
 * RED Phase: These tests are written BEFORE the implementation.
 * They should FAIL until we implement generateGreeting in src/index.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const greeting_1 = require("../greeting");
describe('generateGreetingMessage', () => {
    describe('Input Validation', () => {
        it('throws error when name is missing', async () => {
            const request = {
                name: '',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };
            await expect((0, greeting_1.generateGreetingMessage)(request)).rejects.toThrow('Name is required');
        });
        it('throws error when type is invalid', async () => {
            const request = {
                name: 'John',
                type: 'INVALID',
                language: 'ENGLISH',
            };
            await expect((0, greeting_1.generateGreetingMessage)(request)).rejects.toThrow('Invalid type');
        });
        it('throws error when language is invalid', async () => {
            const request = {
                name: 'John',
                type: 'BIRTHDAY',
                language: 'FRENCH',
            };
            await expect((0, greeting_1.generateGreetingMessage)(request)).rejects.toThrow('Invalid language');
        });
    });
    describe('Greeting Generation', () => {
        it('returns a greeting message containing the name', async () => {
            const request = {
                name: 'Rahul',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };
            const result = await (0, greeting_1.generateGreetingMessage)(request);
            expect(result).toContain('Rahul');
            expect(result.length).toBeGreaterThan(10);
        });
        it('returns birthday-specific message for BIRTHDAY type', async () => {
            const request = {
                name: 'Priya',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };
            const result = await (0, greeting_1.generateGreetingMessage)(request);
            // Should contain birthday-related words
            expect(result.toLowerCase()).toMatch(/birthday|birth|born/);
        });
        it('returns anniversary-specific message for ANNIVERSARY type', async () => {
            const request = {
                name: 'Kumar',
                type: 'ANNIVERSARY',
                language: 'ENGLISH',
            };
            const result = await (0, greeting_1.generateGreetingMessage)(request);
            // Should contain anniversary-related words
            expect(result.toLowerCase()).toMatch(/anniversary|wedding|years/);
        });
        it('returns message in ODIA when language is ODIA', async () => {
            const request = {
                name: 'Sanjay',
                type: 'BIRTHDAY',
                language: 'ODIA',
            };
            const result = await (0, greeting_1.generateGreetingMessage)(request);
            // Odia text uses specific Unicode range
            expect(result).toMatch(/[\u0B00-\u0B7F]/);
        });
        it('returns message in HINDI when language is HINDI', async () => {
            const request = {
                name: 'Amit',
                type: 'BIRTHDAY',
                language: 'HINDI',
            };
            const result = await (0, greeting_1.generateGreetingMessage)(request);
            // Hindi/Devanagari uses specific Unicode range
            expect(result).toMatch(/[\u0900-\u097F]/);
        });
    });
    describe('Edge Cases', () => {
        it('handles very long names gracefully', async () => {
            const request = {
                name: 'Shri Pranab Kumar Balabantaray Ji',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };
            const result = await (0, greeting_1.generateGreetingMessage)(request);
            expect(result).toBeDefined();
            expect(result.length).toBeLessThan(500); // Should be concise
        });
        it('handles names with special characters', async () => {
            const request = {
                name: "O'Brien",
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };
            const result = await (0, greeting_1.generateGreetingMessage)(request);
            expect(result).toContain("O'Brien");
        });
    });
});
//# sourceMappingURL=generateGreeting.test.js.map