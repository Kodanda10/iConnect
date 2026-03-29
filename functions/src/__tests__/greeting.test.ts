import { generateGreetingMessage, GreetingRequest } from '../greeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the Gemini API module globally
jest.mock('@google/generative-ai');

describe('generateGreetingMessage Security', () => {
    let mockGenerateContent: jest.Mock;

    beforeEach(() => {
        // Setup mock for `generateContent` before each test
        mockGenerateContent = jest.fn().mockResolvedValue({
            response: { text: () => 'Mocked generated response' },
        });

        // Mock `GoogleGenerativeAI` to return our mocked `getGenerativeModel`
        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
            getGenerativeModel: () => ({
                generateContent: mockGenerateContent,
            }),
        }));

        // Reset process.env to not interfere between tests
        process.env.GEMINI_API_KEY = 'mock-api-key';
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete process.env.GEMINI_API_KEY;
    });

    it('falls back to "the constituent" if input is completely empty after sanitization', async () => {
        const request: GreetingRequest = {
            name: '<>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'John Doe'
        };

        const result = await generateGreetingMessage(request);

        expect(mockGenerateContent).toHaveBeenCalled();
        const callArgs = mockGenerateContent.mock.calls[0][0];
        // The prompt should use the fallback name "the constituent"
        expect(callArgs).toContain('for the constituent in English');

        // Result should be the mocked value
        expect(result).toBe('Mocked generated response');
    });

    it('sanitizes input before interpolation to prevent prompt injection', async () => {
        const request: GreetingRequest = {
            name: '<script>alert("hacked")</script>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'John Doe'
        };

        const result = await generateGreetingMessage(request);

        expect(mockGenerateContent).toHaveBeenCalled();
        const callArgs = mockGenerateContent.mock.calls[0][0];
        // The prompt should contain the sanitized text
        expect(callArgs).toContain('scriptalert("hacked")/script');
        // The prompt should NOT contain the malicious HTML tags
        expect(callArgs).not.toContain('<script>');

        // Result should be the mocked value
        expect(result).toBe('Mocked generated response');
    });

    it('sanitizes leaderName before interpolation to prevent prompt injection', async () => {
        const request: GreetingRequest = {
            name: 'Jane Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: '<b>Big Boss</b>'
        };

        const result = await generateGreetingMessage(request);

        expect(mockGenerateContent).toHaveBeenCalled();
        const callArgs = mockGenerateContent.mock.calls[0][0];
        // The prompt should contain the sanitized leaderName
        expect(callArgs).toContain('on behalf of bBig Boss/b');
        // The prompt should NOT contain the malicious HTML tags
        expect(callArgs).not.toContain('<b>');

        // Result should be the mocked value
        expect(result).toBe('Mocked generated response');
    });
});
