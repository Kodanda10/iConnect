import { buildPrompt, GreetingRequest } from '../greeting';

describe('Greeting Service', () => {
    describe('buildPrompt', () => {
        it('should generate a prompt with sanitized inputs', () => {
            const request: GreetingRequest = {
                name: 'Test <User>',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
                leaderName: 'Leader & Co',
            };

            const prompt = buildPrompt(request);

            expect(prompt).toContain('<recipient_name>Test &lt;User&gt;</recipient_name>');
            expect(prompt).toContain('<leader_name>Leader &amp; Co</leader_name>');
            expect(prompt).toContain('<instruction>');
            expect(prompt).toContain('</instruction>');
        });

        it('should handle missing leader name', () => {
            const request: GreetingRequest = {
                name: 'Test User',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };

            const prompt = buildPrompt(request);

            expect(prompt).not.toContain('<leader_name>');
        });

        it('should construct correct prompt for anniversary', () => {
            const request: GreetingRequest = {
                name: 'Couple',
                type: 'ANNIVERSARY',
                language: 'HINDI',
            };

            const prompt = buildPrompt(request);
            expect(prompt).toContain('wedding anniversary');
            expect(prompt).toContain('Hindi');
        });
    });
});
