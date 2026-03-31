import { generateGreetingMessage, GreetingRequest } from '../greeting';

// Mock the Gemini API module
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockImplementation((prompt: string) => {
                    return Promise.resolve({
                        response: {
                            text: () => `Mocked response for: ${prompt.split('\n')[0]}`
                        }
                    });
                })
            })
        }))
    };
});

describe('generateGreetingMessage', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        originalEnv = process.env;
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GEMINI_API_KEY = 'test-api-key';
    });

    it('sanitizes malicious name input and calls Gemini with clean prompt', async () => {
        const request: GreetingRequest = {
            name: '<script>alert(1)</script>John',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
        };

        const result = await generateGreetingMessage(request);

        // Ensure the malicious part is removed, but the prompt successfully generated
        expect(result).toContain('Mocked response for: Generate a warm and heartfelt birthday greeting message for scriptalert(1)/scriptJohn in English.');
    });

    it('falls back to "the constituent" if name is completely stripped by sanitization', async () => {
        const request: GreetingRequest = {
            name: '<><>', // This gets entirely stripped out by sanitizeInput
            type: 'BIRTHDAY',
            language: 'ENGLISH',
        };

        const result = await generateGreetingMessage(request);

        // "the constituent" should be used as fallback
        expect(result).toContain('Mocked response for: Generate a warm and heartfelt birthday greeting message for the constituent in English.');
    });

    it('sanitizes malicious leaderName input', async () => {
        const request: GreetingRequest = {
            name: 'Alice',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: '<style>body{display:none}</style>Bob',
        };

        const result = await generateGreetingMessage(request);

        expect(result).toContain('on behalf of stylebody{display:none}/styleBob');
    });

    it('falls back to templates and sanitizes input if Gemini fails or is unconfigured', async () => {
        // Remove API key to force template fallback
        delete process.env.GEMINI_API_KEY;

        const request: GreetingRequest = {
            name: '<script>alert(1)</script>Alice',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
        };

        const result = await generateGreetingMessage(request);

        // Assert malicious content is removed, and it's a template
        expect(result).not.toContain('<script>');
        expect(result).toContain('scriptalert(1)/scriptAlice');
        expect(result.length).toBeGreaterThan(0);
    });

    it('falls back to "the constituent" in templates if name is completely stripped', async () => {
        // Remove API key to force template fallback
        delete process.env.GEMINI_API_KEY;

        const request: GreetingRequest = {
            name: '<><>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
        };

        const result = await generateGreetingMessage(request);

        expect(result).toContain('the constituent');
    });
});
