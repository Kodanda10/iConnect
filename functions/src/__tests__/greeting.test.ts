import { buildPrompt, GreetingRequest } from '../greeting';

describe('Greeting Prompt Generation', () => {
    it('should generate a prompt with sanitized XML tags', () => {
        const request: GreetingRequest = {
            name: 'John Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Jane Smith'
        };

        const prompt = buildPrompt(request);

        expect(prompt).toContain('<constituent_name>John Doe</constituent_name>');
        expect(prompt).toContain('<leader_name>Jane Smith</leader_name>');
        expect(prompt).toContain('Generate a warm and heartfelt birthday greeting message');
        expect(prompt).toContain('in English');
    });

    it('should sanitize inputs to prevent injection', () => {
        const request: GreetingRequest = {
            name: 'John <script>alert(1)</script>',
            type: 'ANNIVERSARY',
            language: 'HINDI',
            leaderName: 'Leader & Chief'
        };

        const prompt = buildPrompt(request);

        // Should be escaped
        expect(prompt).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
        expect(prompt).toContain('Leader &amp; Chief');

        // Should NOT contain raw tags from input
        expect(prompt).not.toContain('<script>');
    });

    it('should handle missing leader name', () => {
        const request: GreetingRequest = {
            name: 'Alice',
            type: 'BIRTHDAY',
            language: 'ODIA'
        };

        const prompt = buildPrompt(request);

        expect(prompt).toContain('<constituent_name>Alice</constituent_name>');
        expect(prompt).not.toContain('<leader_name>');
        expect(prompt).not.toContain('The message is from');
    });
});
