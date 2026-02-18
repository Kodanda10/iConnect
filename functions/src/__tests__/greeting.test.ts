import { generateGreetingMessage, GreetingRequest } from '../greeting';

// Mock Google Generative AI
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn();

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: mockGetGenerativeModel
            };
        })
    };
});

describe('Greeting Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetGenerativeModel.mockReturnValue({
            generateContent: mockGenerateContent
        });
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'Mocked Greeting'
            }
        });
        process.env.GEMINI_API_KEY = 'mock-api-key';
    });

    afterEach(() => {
        delete process.env.GEMINI_API_KEY;
    });

    it('sanitizes input and uses XML structure in prompt', async () => {
        const request: GreetingRequest = {
            name: '<script>alert("XSS")</script>John',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Leader & Co'
        };

        await generateGreetingMessage(request);

        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        const prompt = mockGenerateContent.mock.calls[0][0];

        // Verify XML structure
        expect(prompt).toContain('<instruction>');
        expect(prompt).toContain('</instruction>');
        expect(prompt).toContain('<recipient_name>');
        expect(prompt).toContain('</recipient_name>');
        expect(prompt).toContain('<output_format>');

        // Verify sanitization
        expect(prompt).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;John');
        expect(prompt).toContain('Leader &amp; Co');

        // Verify original dangerous string is NOT present
        expect(prompt).not.toContain('<script>');
    });

    it('works without leader name', async () => {
        const request: GreetingRequest = {
            name: 'Jane',
            type: 'ANNIVERSARY',
            language: 'HINDI'
        };

        await generateGreetingMessage(request);

        const prompt = mockGenerateContent.mock.calls[0][0];
        expect(prompt).toContain('<recipient_name>Jane</recipient_name>');
        expect(prompt).not.toContain('<leader_name>');
    });
});
