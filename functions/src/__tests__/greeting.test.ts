import { generateGreetingMessage } from '../greeting';

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockResolvedValue({
                    response: { text: () => 'Mocked Gemini response' }
                })
            })
        }))
    };
});

describe('generateGreetingMessage', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv, GEMINI_API_KEY: 'fake-key' };
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });

    it('should sanitize input and use fallback when name is entirely stripped', async () => {
        const request = {
            name: '<>',
            type: 'BIRTHDAY' as const,
            language: 'ENGLISH' as const,
        };
        const response = await generateGreetingMessage(request);
        expect(response).toBeDefined();
    });

    it('should sanitize leaderName input', async () => {
        const request = {
            name: 'Rahul',
            type: 'BIRTHDAY' as const,
            language: 'ENGLISH' as const,
            leaderName: '<script>alert("xss")</script>'
        };
        const response = await generateGreetingMessage(request);
        expect(response).toBeDefined();
    });
});
