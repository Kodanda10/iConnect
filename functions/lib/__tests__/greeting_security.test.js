"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const greeting_1 = require("../greeting");
const generative_ai_1 = require("@google/generative-ai");
// Mock GoogleGenerativeAI
jest.mock('@google/generative-ai');
describe('generateGreetingMessage Security', () => {
    let mockGenerateContent;
    beforeEach(() => {
        mockGenerateContent = jest.fn().mockResolvedValue({
            response: { text: () => 'Safe greeting' }
        });
        generative_ai_1.GoogleGenerativeAI.mockImplementation(() => ({
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
        const maliciousRequest = {
            name: 'John <script>alert(1)</script>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Leader " DROP TABLE users --'
        };
        await (0, greeting_1.generateGreetingMessage)(maliciousRequest);
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
//# sourceMappingURL=greeting_security.test.js.map