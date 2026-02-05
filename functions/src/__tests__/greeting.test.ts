import { buildPrompt, GreetingRequest } from '../greeting';

describe('buildPrompt', () => {
    it('should generate a valid prompt for a standard request', () => {
        const request: GreetingRequest = {
            name: 'Rahul',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Modi'
        };

        const prompt = buildPrompt(request);

        expect(prompt).toContain('Generate a warm and heartfelt birthday greeting message on behalf of Modi');
        expect(prompt).toContain('<recipient_name>Rahul</recipient_name>');
        expect(prompt).toContain('<instruction>');
    });

    it('should sanitize malicious input in name', () => {
        const request: GreetingRequest = {
            name: 'Rahul <script>alert(1)</script>',
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        };

        const prompt = buildPrompt(request);

        expect(prompt).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
        expect(prompt).not.toContain('<script>');
        expect(prompt).toContain('<recipient_name>Rahul &lt;script&gt;alert(1)&lt;/script&gt;</recipient_name>');
    });

    it('should sanitize malicious input in leaderName', () => {
        const request: GreetingRequest = {
            name: 'Rahul',
            type: 'ANNIVERSARY',
            language: 'HINDI',
            leaderName: 'Evil <leader>'
        };

        const prompt = buildPrompt(request);

        expect(prompt).toContain('on behalf of Evil &lt;leader&gt;');
        expect(prompt).not.toContain('<leader>');
    });

    it('should handle missing leaderName gracefully', () => {
        const request: GreetingRequest = {
            name: 'Rahul',
            type: 'BIRTHDAY',
            language: 'ODIA'
        };

        const prompt = buildPrompt(request);

        expect(prompt).not.toContain('on behalf of');
        expect(prompt).toContain('in Odia');
    });
});
