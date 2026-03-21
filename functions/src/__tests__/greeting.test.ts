import { generateGreetingMessage } from '../greeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the GoogleGenerativeAI library
jest.mock('@google/generative-ai');

describe('generateGreetingMessage', () => {
    let mockGenerateContent: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GEMINI_API_KEY = 'mock-api-key';

        // Setup mock for generateContent
        mockGenerateContent = jest.fn().mockResolvedValue({
            response: {
                text: () => 'Mocked response'
            }
        });

        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
            getGenerativeModel: () => ({
                generateContent: mockGenerateContent
            })
        }));
    });

    afterEach(() => {
        delete process.env.GEMINI_API_KEY;
    });

    it('sanitizes input to prevent prompt injection', async () => {
        const maliciousName = '<script>alert("hacked")</script>John';
        const maliciousLeader = '<b>Jane</b>';

        await generateGreetingMessage({
            name: maliciousName,
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: maliciousLeader
        });

        // The mocked generateContent should have been called with the prompt
        expect(mockGenerateContent).toHaveBeenCalled();

        const promptUsed = mockGenerateContent.mock.calls[0][0];

        // Assert that the script tags and b tags were stripped
        // Note: sanitizeInput strips the <script> and </script> tags, leaving "alert("hacked")John"
        expect(promptUsed).not.toContain('<script>');
        expect(promptUsed).toContain('alert("hacked")');
        expect(promptUsed).not.toContain('<b>');
        expect(promptUsed).toContain('John');
        expect(promptUsed).toContain('Jane');
    });

    it('falls back to generic string when sanitization strips entirely', async () => {
        const entirelyMalicious = '<script></script>';

        await generateGreetingMessage({
            name: entirelyMalicious,
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        });

        expect(mockGenerateContent).toHaveBeenCalled();

        const promptUsed = mockGenerateContent.mock.calls[0][0];

        // Assert that we fell back to 'the constituent'
        expect(promptUsed).toContain('for the constituent in English');
        expect(promptUsed).not.toContain('<script>');
    });
});
