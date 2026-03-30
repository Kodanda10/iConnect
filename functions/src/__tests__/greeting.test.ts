import { generateGreetingMessage } from '../greeting';

// Mock GoogleGenerativeAI
const mockGenerateContent = jest.fn().mockResolvedValue({
    response: {
        text: () => 'Mocked response'
    }
});

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: mockGenerateContent
            })
        }))
    };
});

describe('greeting service', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = process.env;
        process.env = { ...originalEnv, GEMINI_API_KEY: 'mock-key' };
        jest.clearAllMocks();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('generateGreetingMessage', () => {
        it('should sanitize inputs to prevent prompt injection', async () => {
            const request = {
                name: 'John <script>alert(1)</script>',
                leaderName: 'Jane <b>Doe</b>',
                type: 'BIRTHDAY' as const,
                language: 'ENGLISH' as const,
            };

            await generateGreetingMessage(request);

            expect(mockGenerateContent).toHaveBeenCalled();
            const promptArg = mockGenerateContent.mock.calls[0][0];

            expect(promptArg).not.toContain('<script>');
            expect(promptArg).not.toContain('<b>');
            expect(promptArg).toContain('John scriptalert(1)/script');
            expect(promptArg).toContain('Jane bDoe/b');
        });

        it('should fallback to "the constituent" when name is fully sanitized out', async () => {
            const request = {
                name: '<<<>>>', // Malicious tags only
                type: 'BIRTHDAY' as const,
                language: 'ENGLISH' as const,
            };

            await generateGreetingMessage(request);

            expect(mockGenerateContent).toHaveBeenCalled();
            const promptArg = mockGenerateContent.mock.calls[0][0];

            expect(promptArg).toContain('for the constituent in English');
        });
    });
});
