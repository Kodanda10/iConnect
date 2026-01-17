import { buildPrompt, GreetingRequest } from '../greeting';

// Mock dependencies
jest.mock('@google/generative-ai');

describe('Greeting Security Tests', () => {
    it('should wrap user input in XML tags and sanitize it', () => {
        const request: GreetingRequest = {
            name: 'John <script>alert(1)</script>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Leader <Evil>',
        };

        const prompt = buildPrompt(request);

        // Should contain XML tags
        expect(prompt).toContain('<name>');
        expect(prompt).toContain('</name>');
        expect(prompt).toContain('<leader_name>');
        expect(prompt).toContain('</leader_name>');

        // Should NOT contain raw dangerous characters
        expect(prompt).not.toContain('<script>');
        expect(prompt).not.toContain('<Evil>');

        // Should contain sanitized version
        // Assuming sanitizeInput strips or encodes. Let's assume stripping for now as per "simple is better"
        // or just checking that the raw injection is gone.
    });

    it('should provide clear instructions to use the XML data', () => {
        const request: GreetingRequest = {
            name: 'Jane',
            type: 'ANNIVERSARY',
            language: 'HINDI',
        };

        const prompt = buildPrompt(request);

        expect(prompt).toContain('Use the name provided in the <name> tag');
    });
});
