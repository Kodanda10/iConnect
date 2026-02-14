
import { generateGreetingMessage, GreetingRequest } from '../greeting';

// Mock the GoogleGenerativeAI library
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
    generateContent: mockGenerateContent
}));

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn(() => ({
        getGenerativeModel: mockGetGenerativeModel
    }))
}));

describe('Greeting Generator', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
        // Set API key to enable Gemini path
        process.env.GEMINI_API_KEY = 'test-api-key';
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should sanitize inputs in the prompt to prevent injection', async () => {
        // Setup mock response
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'Sanitized Greeting'
            }
        });

        const maliciousRequest: GreetingRequest = {
            name: '<script>evil</script>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Hackers "R" Us'
        };

        await generateGreetingMessage(maliciousRequest);

        // Verify the prompt passed to Gemini
        const callArgs = mockGenerateContent.mock.calls[0][0];

        // The prompt should NOT contain raw <script> tags
        expect(callArgs).not.toContain('<script>');
        expect(callArgs).toContain('&lt;script&gt;evil&lt;/script&gt;');

        // The prompt should escape quotes in leader name
        expect(callArgs).toContain('Hackers &quot;R&quot; Us');

        // The prompt should contain structure tags (part of my plan)
        expect(callArgs).toContain('<recipient>');
        expect(callArgs).toContain('</recipient>');
    });

    it('should use XML tags for structure in prompt', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'Structured Greeting'
            }
        });

        const request: GreetingRequest = {
            name: 'John Doe',
            type: 'ANNIVERSARY',
            language: 'HINDI',
            leaderName: 'Leader Name'
        };

        await generateGreetingMessage(request);

        const prompt = mockGenerateContent.mock.calls[0][0];

        // Check for XML structure
        expect(prompt).toContain('<instruction>');
        expect(prompt).toContain('<recipient>John Doe</recipient>');
        expect(prompt).toContain('<sender>Leader Name</sender>');
    });
});
