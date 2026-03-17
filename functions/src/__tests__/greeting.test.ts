import { generateGreetingMessage, GreetingRequest } from '../greeting';

// Mock generative-ai so we don't make actual API calls
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockResolvedValue({
                response: {
                    text: () => 'Mocked AI greeting message',
                },
            }),
        }),
    })),
}));

describe('greeting service', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        originalEnv = process.env;
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('generateGreetingMessage (template fallback)', () => {
        beforeEach(() => {
            // Unset GEMINI_API_KEY to force template fallback
            delete process.env.GEMINI_API_KEY;
        });

        it('should generate a valid template message', async () => {
            const request: GreetingRequest = {
                name: 'Alice',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };
            const message = await generateGreetingMessage(request);
            expect(message).toContain('Alice');
        });

        it('should sanitize HTML tags from name', async () => {
            const request: GreetingRequest = {
                name: '<b>Bob</b><script>alert("xss")</script>',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };
            const message = await generateGreetingMessage(request);
            expect(message).toContain('Bobalert("xss")'); // Tags removed, inner text remains
            expect(message).not.toContain('<script>');
            expect(message).not.toContain('<b>');
        });

        it('should fall back to "the constituent" if name is entirely stripped', async () => {
            const request: GreetingRequest = {
                name: '<img src="x" onerror="alert(1)">', // Only tags/attributes
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };
            const message = await generateGreetingMessage(request);
            expect(message).toContain('the constituent');
            expect(message).not.toContain('<img');
        });
    });

    describe('generateGreetingMessage (Gemini AI)', () => {
        beforeEach(() => {
            process.env.GEMINI_API_KEY = 'mock-api-key';
        });

        it('should use the Gemini model when API key is provided', async () => {
            const request: GreetingRequest = {
                name: 'Alice',
                type: 'BIRTHDAY',
                language: 'ENGLISH',
            };
            const message = await generateGreetingMessage(request);
            expect(message).toBe('Mocked AI greeting message');
        });

        // Testing buildPrompt output indirectly via a spy could be done, but we test the module logic here.
    });
});
