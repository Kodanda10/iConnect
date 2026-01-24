import { buildPrompt, GreetingRequest } from '../greeting';

describe('Greeting Service', () => {
    describe('buildPrompt', () => {
        it('should structure prompt with XML tags', () => {
            const req: GreetingRequest = {
                name: 'John Doe',
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            };
            const prompt = buildPrompt(req);
            expect(prompt).toContain('<name>John Doe</name>');
            expect(prompt).toContain('inside the <name> tags');
        });

        it('should sanitize input in prompt', () => {
            const req: GreetingRequest = {
                name: 'John <script>hack</script>',
                type: 'ANNIVERSARY',
                language: 'HINDI'
            };
            const prompt = buildPrompt(req);
            expect(prompt).toContain('<name>John hack</name>');
            expect(prompt).not.toContain('<script>');
        });

        it('should include leader name if provided and sanitized', () => {
            const req: GreetingRequest = {
                name: 'Alice',
                type: 'BIRTHDAY',
                language: 'ODIA',
                leaderName: 'Leader <b>bold</b>'
            };
            const prompt = buildPrompt(req);
            expect(prompt).toContain('on behalf of Leader bold');
            expect(prompt).not.toContain('<b>');
        });
    });
});
