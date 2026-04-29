"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const greeting_1 = require("../greeting");
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockResolvedValue({
                    response: { text: () => 'Mocked Gemini response' }
                })
            })
        }))
    };
});
describe('generateGreetingMessage', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        process.env = { ...originalEnv, GEMINI_API_KEY: 'fake-key' };
    });
    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });
    it('should sanitize input and use fallback when name is entirely stripped', async () => {
        const request = {
            name: '<>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
        };
        const response = await (0, greeting_1.generateGreetingMessage)(request);
        expect(response).toBeDefined();
    });
    it('should sanitize leaderName input', async () => {
        const request = {
            name: 'Rahul',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: '<script>alert("xss")</script>'
        };
        const response = await (0, greeting_1.generateGreetingMessage)(request);
        expect(response).toBeDefined();
    });
});
//# sourceMappingURL=greeting.test.js.map