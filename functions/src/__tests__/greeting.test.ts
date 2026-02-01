import { buildPrompt, GreetingRequest } from '../greeting';

describe('Greeting Prompt Generation', () => {
    const baseRequest: GreetingRequest = {
        name: 'John Doe',
        type: 'BIRTHDAY',
        language: 'ENGLISH',
    };

    it('should generate a prompt with XML tags', () => {
        const prompt = buildPrompt(baseRequest);
        expect(prompt).toContain('<instruction>');
        expect(prompt).toContain('</instruction>');
        expect(prompt).toContain('<context>');
        expect(prompt).toContain('</context>');
        expect(prompt).toContain('<recipient_name>John Doe</recipient_name>');
    });

    it('should sanitize user input in the prompt', () => {
        const maliciousRequest: GreetingRequest = {
            ...baseRequest,
            name: 'John <script>alert(1)</script>',
        };
        const prompt = buildPrompt(maliciousRequest);

        // Should NOT contain raw tags
        expect(prompt).not.toContain('<script>');

        // Should contain escaped entities
        expect(prompt).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('should include sender name if provided', () => {
        const requestWithLeader: GreetingRequest = {
            ...baseRequest,
            leaderName: 'Leader Jane',
        };
        const prompt = buildPrompt(requestWithLeader);
        expect(prompt).toContain('<sender_name>Leader Jane</sender_name>');
    });

    it('should sanitize sender name', () => {
        const maliciousLeader: GreetingRequest = {
            ...baseRequest,
            leaderName: 'Leader "Evil"',
        };
        const prompt = buildPrompt(maliciousLeader);
        expect(prompt).toContain('Leader &quot;Evil&quot;');
    });
});
