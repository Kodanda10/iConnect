import { generateGreetingMessage } from '../greeting';

const mockGenerateContent = jest.fn().mockResolvedValue({
    response: { text: () => 'Mocked response' }
});

const mockGetGenerativeModel = jest.fn().mockReturnValue({
    generateContent: mockGenerateContent
});

// Mock the Generative AI library
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: mockGetGenerativeModel
            };
        })
    };
});

describe('generateGreetingMessage', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...OLD_ENV, GEMINI_API_KEY: 'test-api-key' };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('sanitizes input with inner text preservation', async () => {
        await generateGreetingMessage({
            name: '<script>alert("hacked")</script>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: '<b>Admin</b>'
        });

        const callArg = mockGenerateContent.mock.calls[0][0];

        // Ensure inner text is preserved without tags
        expect(callArg).toContain('for alert("hacked") in English');
        expect(callArg).toContain('on behalf of Admin');
        expect(callArg).not.toContain('<script>');
        expect(callArg).not.toContain('<b>');
    });

    it('falls back to "the constituent" when input is completely stripped', async () => {
        await generateGreetingMessage({
            name: '<script></script>', // Completely stripped, no inner text
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        });

        const callArg = mockGenerateContent.mock.calls[0][0];

        // Ensure fallback works
        expect(callArg).toContain('for the constituent in English');
        expect(callArg).not.toContain('<script>');
    });
});
