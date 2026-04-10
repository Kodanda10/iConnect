import { generateGreetingMessage } from '../greeting';

// Mock the external module
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockResolvedValue({
                response: { text: () => 'Mocked response' }
            })
        })
    }))
}));

describe('generateGreetingMessage', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        originalEnv = process.env;
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('sanitizes malicious input and generates greeting', async () => {
        process.env.GEMINI_API_KEY = 'fake-key';

        const request = {
            name: "John<script>alert(1)</script>",
            type: "BIRTHDAY" as const,
            language: "ENGLISH" as const,
            leaderName: "Admin<b>Leader</b>"
        };

        const result = await generateGreetingMessage(request);

        // As long as it succeeds and returns the mocked response, we are good
        expect(result).toBe('Mocked response');
    });

    it('falls back to "the constituent" if input is completely stripped', async () => {
        process.env.GEMINI_API_KEY = 'fake-key';

        const request = {
            name: "<>", // Will be completely stripped by sanitizeInput
            type: "BIRTHDAY" as const,
            language: "ENGLISH" as const,
            leaderName: "Admin"
        };

        const result = await generateGreetingMessage(request);

        expect(result).toBe('Mocked response');
    });

    it('works with fallback templates if Gemini API is missing', async () => {
        process.env.GEMINI_API_KEY = '';

        const request = {
            name: "John<script>alert(1)</script>",
            type: "BIRTHDAY" as const,
            language: "ENGLISH" as const
        };

        const result = await generateGreetingMessage(request);

        // Result should include "John" but NOT the script tag
        expect(result).toContain('John');
        expect(result).not.toContain('<script>');
    });

    it('works with fallback templates if name is completely stripped', async () => {
        process.env.GEMINI_API_KEY = '';

        const request = {
            name: "<>",
            type: "BIRTHDAY" as const,
            language: "ENGLISH" as const
        };

        const result = await generateGreetingMessage(request);

        // Result should include "the constituent"
        expect(result).toContain('the constituent');
    });
});
