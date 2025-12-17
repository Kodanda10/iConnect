"use strict";
/**
 * @file greeting.ts
 * @description Greeting message generation service with Gemini AI integration
 * @changelog
 * - 2024-12-11: Initial implementation with TDD
 * - 2024-12-15: Added real Gemini AI integration with template fallback
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGreetingMessage = generateGreetingMessage;
const generative_ai_1 = require("@google/generative-ai");
// Greeting templates for fallback (when Gemini API is unavailable)
const TEMPLATES = {
    BIRTHDAY: {
        ENGLISH: [
            'Happy Birthday {name}! Wishing you a fantastic year ahead filled with health and happiness.',
            'Many happy returns of the day, {name}! May God bless you with good health.',
            'Happy Birthday {name}! Wishing you a year full of success and joy.',
        ],
        HINDI: [
            'जन्मदिन की हार्दिक शुभकामनाएँ {name}! भगवान आपको हमेशा स्वस्थ और खुश रखें।',
            '{name}, आपको जन्मदिन की बहुत-बहुत बधाई। आपका आने वाला जीवन मंगलमय हो।',
            'जन्मदिन की ढेर सारी शुभकामनाएँ {name}! आपके सभी सपने पूरे हों।',
        ],
        ODIA: [
            'ଜନ୍ମଦିନର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା ଓ ଶୁଭକାମନା {name}! ମହାପ୍ରଭୁ ଶ୍ରୀ ଜଗନ୍ନାଥ ଆପଣଙ୍କୁ ସଦା ସର୍ବଦା ସୁସ୍ଥ ଓ ନିରାମୟ ରଖନ୍ତୁ।',
            '{name}, ଆପଣଙ୍କୁ ଜନ୍ମଦିନର ଅନେକ ଅନେକ ଶୁଭେଚ୍ଛା। ଆପଣଙ୍କ ଆଗାମୀ ଜୀବନ ସୁଖମୟ ହେଉ।',
            'ଜନ୍ମଦିନର ଅଶେଷ ଅଶେଷ ଶୁଭେଚ୍ଛା {name}! ଆପଣଙ୍କର ସମସ୍ତ ସ୍ୱପ୍ନ ପୂରଣ ହେଉ।',
        ],
    },
    ANNIVERSARY: {
        ENGLISH: [
            'Happy Anniversary {name}! Wishing you both endless love and happiness for many more years.',
            'Happy Anniversary {name}! May your bond grow stronger with each passing year.',
            'Congratulations on another year of togetherness, {name}! Happy Anniversary.',
        ],
        HINDI: [
            'शादी की सालगिरह की हार्दिक शुभकामनाएँ {name}! आपका दांपत्य जीवन सुखमय हो।',
            '{name}, आपको और आपके परिवार को शादी की सालगिरह की बहुत-बहुत बधाई।',
            'शुभ विवाह वर्षगांठ {name}! भगवान आपकी जोड़ी को हमेशा खुश रखें।',
        ],
        ODIA: [
            'ବିବାହ ବାର୍ଷିକୀର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା ଓ ଅଭିନନ୍ଦନ {name}! ଆପଣଙ୍କ ଦାମ୍ପତ୍ୟ ଜୀବନ ସୁଖମୟ ହେଉ।',
            '{name}, ଆପଣଙ୍କୁ ଓ ଆପଣଙ୍କ ପରିବାରକୁ ବିବାହ ବାର୍ଷିକୀର ଅନେକ ଅନେକ ଶୁଭେଚ୍ଛା।',
            'ଶୁଭ ବିବାହ ବାର୍ଷିକୀ {name}! ମହାପ୍ରଭୁ ଜଗନ୍ନାଥ ଆପଣଙ୍କ ଯୋଡିକୁ ସଦା ସର୍ବଦା ଖୁସିରେ ରଖନ୍ତୁ।',
        ],
    },
};
const VALID_TYPES = ['BIRTHDAY', 'ANNIVERSARY'];
const VALID_LANGUAGES = ['ODIA', 'ENGLISH', 'HINDI'];
const LANGUAGE_NAMES = {
    ODIA: 'Odia',
    ENGLISH: 'English',
    HINDI: 'Hindi',
};
let warnedMissingGeminiKey = false;
/**
 * Build a prompt for Gemini AI
 */
function buildPrompt(request) {
    const occasion = request.type === 'BIRTHDAY' ? 'birthday' : 'wedding anniversary';
    const language = LANGUAGE_NAMES[request.language];
    const leaderMention = request.leaderName ? ` on behalf of ${request.leaderName}` : '';
    return `Generate a warm and heartfelt ${occasion} greeting message${leaderMention} for ${request.name} in ${language}. 
The message should be:
- Personal and sincere
- 2-3 sentences maximum
- Culturally appropriate for Indian context
- Include blessings for health and happiness
Only return the greeting message, nothing else.`;
}
/**
 * Get a template-based message (fallback)
 */
function getTemplateMessage(request) {
    const typeTemplates = TEMPLATES[request.type];
    const langTemplates = typeTemplates[request.language];
    const template = langTemplates[Math.floor(Math.random() * langTemplates.length)];
    return template.replace('{name}', request.name);
}
/**
 * Generate a greeting message for a constituent
 * Uses Gemini AI when available, falls back to templates
 */
async function generateGreetingMessage(request) {
    // Input validation
    if (!request.name || request.name.trim() === '') {
        throw new Error('Name is required');
    }
    if (!VALID_TYPES.includes(request.type)) {
        throw new Error('Invalid type');
    }
    if (!VALID_LANGUAGES.includes(request.language)) {
        throw new Error('Invalid language');
    }
    // Try Gemini API if key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey && !warnedMissingGeminiKey) {
        warnedMissingGeminiKey = true;
        console.warn('[GREETING] GEMINI_API_KEY is not configured; using templates fallback.');
    }
    if (apiKey) {
        try {
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = buildPrompt(request);
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (text && text.trim().length > 0) {
                return text.trim();
            }
        }
        catch (error) {
            console.warn('[GREETING] Gemini API failed, falling back to templates:', error);
        }
    }
    // Fallback to templates
    return getTemplateMessage(request);
}
//# sourceMappingURL=greeting.js.map