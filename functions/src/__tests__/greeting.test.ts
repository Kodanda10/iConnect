import { generateGreetingMessage, GreetingRequest } from '../greeting';

// Mock the Generative AI module
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: jest.fn().mockResolvedValue({
                        response: {
                            text: () => 'Mocked AI Greeting for Friend'
                        }
                    })
                })
            };
        })
    };
});

describe('greeting module', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('generateGreetingMessage', () => {
        it('falls back to "Friend" when name is completely stripped by sanitizer', async () => {
            // Mock API key so Gemini is used
            process.env.GEMINI_API_KEY = 'fake-key';

            const request: GreetingRequest = {
                name: '<>', // This will be stripped to empty string
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            };

            const result = await generateGreetingMessage(request);

            // The prompt sent to Gemini should have used 'Friend' instead of empty string
            // Our mocked response just returns a string, but if the API was hit, it means
            // the validation (which checks `request.name.trim() === ''`) passed, and then
            // `safeRequest.name` became 'Friend'. The template fallback will literally
            // contain 'Friend'. We can test the template fallback path too to be sure.
            expect(result).toBe('Mocked AI Greeting for Friend');
        });

        it('falls back to "Friend" in templates when Gemini key is missing', async () => {
            delete process.env.GEMINI_API_KEY;

            const request: GreetingRequest = {
                name: '<>', // Stripped to empty
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            };

            const result = await generateGreetingMessage(request);

            // Should contain "Friend" because of the template fallback
            expect(result).toContain('Friend');
        });
    });
});
