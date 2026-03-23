import { generateGreetingMessage, GreetingRequest } from '../greeting';

// Mock the GoogleGenerativeAI library
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: jest.fn().mockImplementation((prompt: string) => {
                        return Promise.resolve({
                            response: {
                                text: () => `Mocked response for prompt: ${prompt}`
                            }
                        });
                    })
                })
            };
        })
    };
});

describe('greeting.ts', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('sanitizes input before passing to Generative AI', async () => {
        process.env.GEMINI_API_KEY = 'test-api-key';

        const request: GreetingRequest = {
            name: "<script>alert('hacked')</script> John",
            leaderName: "<b>Mayor</b> Jane",
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        };

        const response = await generateGreetingMessage(request);

        // Ensure "alert('hacked')" and "Mayor" are kept, but the prompt should not contain the original tags
        expect(response).toContain('alert(\'hacked\') John');
        expect(response).toContain('Mayor Jane');
        expect(response).not.toContain('<script>');
        expect(response).not.toContain('<b>');
    });

    it('falls back to generic string when input is completely stripped (prompt injection fallback)', async () => {
        process.env.GEMINI_API_KEY = 'test-api-key';

        const request: GreetingRequest = {
            name: "<script></script>", // Will be stripped to empty string
            leaderName: "<iframe></iframe>", // Will be stripped to empty string
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        };

        const response = await generateGreetingMessage(request);

        // Ensure the fallback "the constituent" and "the leader" are used instead of empty string
        expect(response).toContain('the constituent');
        expect(response).toContain('the leader');
        expect(response).not.toContain('<script>');
        expect(response).not.toContain('<iframe>');
    });

    it('falls back to generic string in template message when input is completely stripped', async () => {
        delete process.env.GEMINI_API_KEY; // Force template fallback

        const request: GreetingRequest = {
            name: "<script></script>", // Will be stripped to empty string
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        };

        const response = await generateGreetingMessage(request);

        // In the template fallback, it should use 'the constituent'
        expect(response).toContain('the constituent');
    });

    it('preserves valid names in template messages', async () => {
        delete process.env.GEMINI_API_KEY;

        const request: GreetingRequest = {
            name: "John Doe",
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        };

        const response = await generateGreetingMessage(request);
        expect(response).toContain('John Doe');
    });
});
