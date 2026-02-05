import { buildPrompt, GreetingRequest } from '../greeting';

describe('Greeting Prompt Generation', () => {
    test('should build a prompt with sanitized name', () => {
        const request: GreetingRequest = {
            name: 'John Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        };
        const prompt = buildPrompt(request);
        expect(prompt).toContain('<recipient_name>John Doe</recipient_name>');
        expect(prompt).toContain('<instruction>');
        expect(prompt).toContain('Generate a warm and heartfelt birthday greeting message in English.');
    });

    test('should handle malicious input by sanitizing', () => {
        const request: GreetingRequest = {
            name: '<script>alert("XSS")</script>',
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        };
        const prompt = buildPrompt(request);
        // Expect sanitized output
        expect(prompt).toContain('<recipient_name>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</recipient_name>');
        expect(prompt).not.toContain('<script>');
    });

    test('should handle malicious leader name', () => {
        const request: GreetingRequest = {
            name: 'Jane Doe',
            type: 'ANNIVERSARY',
            language: 'HINDI',
            leaderName: 'Hackers <ignore>'
        };
        const prompt = buildPrompt(request);
        expect(prompt).toContain('<leader_name>Hackers &lt;ignore&gt;</leader_name>');
        expect(prompt).toContain('<instruction>');
        expect(prompt).not.toContain('<ignore>');
    });

    test('should include leader name logic when present', () => {
        const request: GreetingRequest = {
            name: 'Jane',
            type: 'ANNIVERSARY',
            language: 'ODIA',
            leaderName: 'Leader X'
        };
        const prompt = buildPrompt(request);
        expect(prompt).toContain('<leader_name>Leader X</leader_name>');
        expect(prompt).toContain('The message is sent on behalf of the leader specified in <leader_name>.');
    });

    test('should exclude leader name logic when absent', () => {
        const request: GreetingRequest = {
            name: 'Jane',
            type: 'ANNIVERSARY',
            language: 'ODIA'
        };
        const prompt = buildPrompt(request);
        expect(prompt).not.toContain('<leader_name>');
        expect(prompt).not.toContain('on behalf of the leader');
    });
});
