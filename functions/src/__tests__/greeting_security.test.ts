
import { generateGreetingMessage, GreetingRequest } from '../greeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock GoogleGenerativeAI
jest.mock('@google/generative-ai');

describe('generateGreetingMessage Security', () => {
    let mockGenerateContent: jest.Mock;

    beforeEach(() => {
        mockGenerateContent = jest.fn().mockResolvedValue({
            response: { text: () => 'Safe greeting' }
        });

        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: mockGenerateContent
            })
        }));

        process.env.GEMINI_API_KEY = 'test-key';
    });

    afterEach(() => {
        delete process.env.GEMINI_API_KEY;
        jest.clearAllMocks();
    });

    it('should sanitize input to prevent prompt injection', async () => {
        const maliciousRequest: GreetingRequest = {
            name: 'John <script>alert(1)</script>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Leader " DROP TABLE users --'
        };

        await generateGreetingMessage(maliciousRequest);

        const callArgs = mockGenerateContent.mock.calls[0][0];

        // Assert that the raw malicious string is NOT present in the prompt
        // Specifically the dangerous parts
        expect(callArgs).not.toContain('<script>');

        // Verify that quotes are escaped (preventing breaking out of string context)
        expect(callArgs).not.toContain('" DROP TABLE');
        expect(callArgs).toContain('&quot; DROP TABLE');

        // Or we can expect encoded versions if that's what sanitizeInput does
        // For now, let's just ensure the raw attack vectors are gone.
    });
});
