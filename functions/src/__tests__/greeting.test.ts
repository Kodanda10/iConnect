import { generateGreetingMessage, GreetingRequest } from '../greeting';

describe('generateGreetingMessage', () => {
    it('throws error if name is missing or empty', async () => {
        const req: GreetingRequest = { name: '', type: 'BIRTHDAY', language: 'ENGLISH' };
        await expect(generateGreetingMessage(req)).rejects.toThrow('Name is required');
    });

    it('sanitizes input to prevent prompt injection and XSS', async () => {
        const req: GreetingRequest = {
            name: '<script>alert(1)</script> John Doe \x00',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: '<h1>Leader</h1> \x01 Jane'
        };
        const msg = await generateGreetingMessage(req);
        // Ensure templates get the sanitized inputs
        expect(msg).toContain('John Doe');
        expect(msg).not.toContain('<script>');
        expect(msg).not.toContain('\x00');
    });

    it('falls back to "the constituent" if name is entirely stripped', async () => {
        const req: GreetingRequest = {
            name: '<script></script>',
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        };
        const msg = await generateGreetingMessage(req);
        expect(msg).toContain('the constituent');
    });
});
