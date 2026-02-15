
import { generateGreetingMessage, GreetingRequest } from '../greeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the GoogleGenerativeAI library
jest.mock('@google/generative-ai');

describe('generateGreetingMessage', () => {
    let mockGenerateContent: jest.Mock;
    let mockGetGenerativeModel: jest.Mock;

    beforeEach(() => {
        // Reset mocks
        mockGenerateContent = jest.fn().mockResolvedValue({
            response: {
                text: () => 'Mocked greeting message'
            }
        });
        mockGetGenerativeModel = jest.fn().mockReturnValue({
            generateContent: mockGenerateContent
        });
        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
            getGenerativeModel: mockGetGenerativeModel
        }));

        // Mock environment variable
        process.env.GEMINI_API_KEY = 'mock-api-key';
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete process.env.GEMINI_API_KEY;
    });

    it('should generate a greeting with XML tags and sanitized input', async () => {
        const request: GreetingRequest = {
            name: 'John <script>alert(1)</script> Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Leader & Co'
        };

        await generateGreetingMessage(request);

        // Access the prompt passed to generateContent
        const actualPrompt = mockGenerateContent.mock.calls[0][0];

        // Assert that the prompt contains XML tags and sanitized content
        // This expects the new secure implementation
        expect(actualPrompt).toContain('<recipient>John &lt;script&gt;alert(1)&lt;/script&gt; Doe</recipient>');
        expect(actualPrompt).toContain('<sender>Leader &amp; Co</sender>');
        expect(actualPrompt).toContain('<instruction>');
    });
});
