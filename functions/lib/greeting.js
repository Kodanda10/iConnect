"use strict";
/**
 * @file greeting.ts
 * @description Greeting message generation service
 * @changelog
 * - 2024-12-11: Initial implementation with TDD
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGreetingMessage = generateGreetingMessage;
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
/**
 * Generate a greeting message for a constituent
 * Uses templates as fallback when Gemini API is unavailable
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
    // Get templates for the type and language
    const typeTemplates = TEMPLATES[request.type];
    const langTemplates = typeTemplates[request.language];
    // Pick a random template
    const template = langTemplates[Math.floor(Math.random() * langTemplates.length)];
    // Replace placeholder with actual name
    const message = template.replace('{name}', request.name);
    return message;
}
//# sourceMappingURL=greeting.js.map