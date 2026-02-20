import { buildPrompt, GreetingRequest } from '../greeting';

describe('Greeting Service', () => {
    describe('buildPrompt', () => {
        it('should structure prompt with XML tags', () => {
            const request: GreetingRequest = {
                name: 'Alice',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };
            const prompt = buildPrompt(request);
            expect(prompt).toContain('<instruction>');
            expect(prompt).toContain('</instruction>');
            expect(prompt).toContain('<recipient_name>Alice</recipient_name>');
            expect(prompt).toContain('birthday');
            expect(prompt).toContain('English');
        });

        it('should sanitize inputs in prompt', () => {
            const request: GreetingRequest = {
                name: '<script>Alice</script>',
                type: 'ANNIVERSARY',
                language: 'HINDI',
            };
            const prompt = buildPrompt(request);
            expect(prompt).toContain('&lt;script&gt;Alice&lt;/script&gt;');
            expect(prompt).toContain('<recipient_name>');
            expect(prompt).not.toContain('<script>');
        });

        it('should include leader context if provided', () => {
            const request: GreetingRequest = {
                name: 'Bob',
                type: 'BIRTHDAY',
                language: 'ODIA',
                leaderName: 'Leader X',
            };
            const prompt = buildPrompt(request);
            expect(prompt).toContain('<leader_name>Leader X</leader_name>');
        });

        it('should sanitize leader name', () => {
             const request: GreetingRequest = {
                name: 'Bob',
                type: 'BIRTHDAY',
                language: 'ODIA',
                leaderName: 'Leader & Co',
            };
            const prompt = buildPrompt(request);
            expect(prompt).toContain('<leader_name>Leader &amp; Co</leader_name>');
        });

        it('should not include leader tag if not provided', () => {
            const request: GreetingRequest = {
                name: 'Bob',
                type: 'BIRTHDAY',
                language: 'ODIA',
            };
            const prompt = buildPrompt(request);
            expect(prompt).not.toContain('<leader_name>');
        });
    });
});
