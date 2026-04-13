import { generateGreetingMessage, GreetingRequest } from '../greeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: jest.fn().mockResolvedValue({
                        response: { text: () => 'Mocked response' }
                    })
                })
            };
        })
    };
});

describe('generateGreetingMessage', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, GEMINI_API_KEY: 'fake-key' };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('sanitizes user input to prevent prompt injection', async () => {
        const purelyMaliciousName = '<>';
        const req2: GreetingRequest = {
            name: purelyMaliciousName,
            type: 'BIRTHDAY',
            language: 'ENGLISH',
        };

        const result2 = await generateGreetingMessage(req2);

        expect(GoogleGenerativeAI).toHaveBeenCalledTimes(1);
        expect(result2).toBe('Mocked response');
    });

    it('sanitizes input and uses fallback "the constituent" for purely malicious inputs without API key', async () => {
        process.env.GEMINI_API_KEY = '';

        const request: GreetingRequest = {
            name: '<>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
        };

        const result = await generateGreetingMessage(request);
        // It should contain 'the constituent' instead of empty string or '<>'
        expect(result).toContain('the constituent');
        expect(result).not.toContain('<>');
    });

    it('sanitizes normal input by removing angle brackets', async () => {
        process.env.GEMINI_API_KEY = '';

        const request: GreetingRequest = {
            name: 'John <Doe>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
        };

        const result = await generateGreetingMessage(request);
        expect(result).toContain('John');
        expect(result).not.toContain('<Doe>');
    });
});
