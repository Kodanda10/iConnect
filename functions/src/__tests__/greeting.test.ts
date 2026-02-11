
import { buildPrompt, GreetingRequest } from '../greeting';

describe('Greeting Generator', () => {
    describe('buildPrompt', () => {
        it('should structure prompt with XML delimiters', () => {
            const request: GreetingRequest = {
                name: 'John Doe',
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            };
            const prompt = buildPrompt(request);

            expect(prompt).toContain('<instruction>');
            expect(prompt).toContain('</instruction>');
            expect(prompt).toContain('<recipient_name>John Doe</recipient_name>');
            expect(prompt).toContain('In language: English');
            expect(prompt).toContain('birthday greeting message');
        });

        it('should sanitize recipient name', () => {
            const request: GreetingRequest = {
                name: '<script>alert(1)</script>',
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            };
            const prompt = buildPrompt(request);

            // Expect HTML entities
            expect(prompt).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
            // Should NOT contain raw script tag
            expect(prompt).not.toContain('<script>');
        });

        it('should sanitize leader name', () => {
            const request: GreetingRequest = {
                name: 'John',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
                leaderName: 'Leader <Important>'
            };
            const prompt = buildPrompt(request);

            expect(prompt).toContain('on behalf of Leader &lt;Important&gt;');
        });

        it('should handle Hindi language correctly', () => {
            const request: GreetingRequest = {
                name: 'Ramesh',
                type: 'ANNIVERSARY',
                language: 'HINDI'
            };
            const prompt = buildPrompt(request);

            expect(prompt).toContain('wedding anniversary greeting message');
            expect(prompt).toContain('In language: Hindi');
        });
    });
});
