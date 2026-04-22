import { generateGreetingMessage, GreetingRequest } from '../greeting';


// Mock @google/generative-ai
jest.mock('@google/generative-ai', () => {
    const mockGenerateContent = jest.fn();
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: () => ({
                generateContent: mockGenerateContent,
            }),
        })),
        _mockGenerateContent: mockGenerateContent, // Expose for tests
    };
});

// Access the mocked function
const { _mockGenerateContent } = require('@google/generative-ai');

describe('generateGreetingMessage Security & Fallback', () => {
    let originalEnvApiKey: string | undefined;

    beforeEach(() => {
        // Mock the API key so the Gemini code path is executed
        originalEnvApiKey = process.env.GEMINI_API_KEY;
        process.env.GEMINI_API_KEY = 'fake-key';
        jest.clearAllMocks();
    });

    afterEach(() => {
        process.env.GEMINI_API_KEY = originalEnvApiKey;
    });

    it('strips HTML tags and uses sanitized name in prompt', async () => {
        _mockGenerateContent.mockResolvedValue({
            response: { text: () => 'Mocked response' },
        });

        const request: GreetingRequest = {
            name: '<script>alert("xss")</script>John Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
        };

        await generateGreetingMessage(request);

        // The name should be sanitized to "alert(xss)John Doe"
        // Since tags are stripped, but content within is kept.
        // Oh actually, <script> and </script> are stripped.
        // Let's test what sanitizeInput actually does. '<script>alert("xss")</script>' -> 'alert("xss")'
        expect(_mockGenerateContent).toHaveBeenCalledTimes(1);
        const prompt = _mockGenerateContent.mock.calls[0][0];
        expect(prompt).toContain('John Doe');
        expect(prompt).not.toContain('<script>');
    });

    it('falls back to "the constituent" if input is completely stripped', async () => {
        _mockGenerateContent.mockResolvedValue({
            response: { text: () => 'Mocked response' },
        });

        const request: GreetingRequest = {
            // Completely stripped input (only tags and control chars)
            name: '<bad>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
        };

        await generateGreetingMessage(request);

        expect(_mockGenerateContent).toHaveBeenCalledTimes(1);
        const prompt = _mockGenerateContent.mock.calls[0][0];
        // The malicious name was stripped to '', so it should fallback to 'the constituent'
        expect(prompt).toContain('the constituent');
        expect(prompt).not.toContain('<bad>');
    });

    it('sanitizes leaderName correctly', async () => {
         _mockGenerateContent.mockResolvedValue({
            response: { text: () => 'Mocked response' },
        });

        const request: GreetingRequest = {
            name: 'Jane Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: '<b>Admin</b>'
        };

        await generateGreetingMessage(request);

        expect(_mockGenerateContent).toHaveBeenCalledTimes(1);
        const prompt = _mockGenerateContent.mock.calls[0][0];

        expect(prompt).toContain('on behalf of Admin');
        expect(prompt).not.toContain('<b>');
    });
});
