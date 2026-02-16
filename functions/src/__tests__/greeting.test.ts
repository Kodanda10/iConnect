import { generateGreetingMessage, GreetingRequest } from '../greeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock GoogleGenerativeAI
jest.mock('@google/generative-ai');

describe('Greeting Service', () => {
    let mockGenerateContent: jest.Mock;

    beforeEach(() => {
        mockGenerateContent = jest.fn().mockResolvedValue({
            response: { text: () => 'Mocked Greeting' }
        });
        (GoogleGenerativeAI as unknown as jest.Mock).mockReturnValue({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: mockGenerateContent
            })
        });
        process.env.GEMINI_API_KEY = 'mock-key';
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete process.env.GEMINI_API_KEY;
    });

    it('should sanitize input in the prompt to prevent injection', async () => {
        const request: GreetingRequest = {
            name: '<script>alert(1)</script>',
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        };

        await generateGreetingMessage(request);

        const prompt = mockGenerateContent.mock.calls[0][0];

        // Check that raw input is NOT present (it should be escaped)
        expect(prompt).not.toContain('<script>');

        // Check that escaped input IS present
        expect(prompt).toContain('&lt;script&gt;');
    });

     it('should wrap input in XML tags for robustness', async () => {
        const request: GreetingRequest = {
            name: 'John Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        };

        await generateGreetingMessage(request);

        const prompt = mockGenerateContent.mock.calls[0][0];
        // Check for XML structure
        expect(prompt).toContain('<recipient_name>'); // Updated tag name to match my plan or implementation intent
        expect(prompt).toContain('John Doe');
        expect(prompt).toContain('<instruction>');
    });
});
