import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CampaignRequest {
    eventName: string;
    leaderName: string;
    language: 'ODIA' | 'ENGLISH' | 'HINDI';
}

export const generateCampaignVariations = onCall<CampaignRequest>(
    { region: 'asia-south1' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'User must be authenticated');
        }

        const { eventName, leaderName, language } = request.data;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn('[CAMPAIGN] GEMINI_API_KEY is not configured; using templates fallback.');
            if (language === 'ODIA') return { variations: [`${eventName} ଉପଲକ୍ଷେ ଆପଣଙ୍କୁ ଓ ଆପଣଙ୍କ ପରିବାରକୁ ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା। - ${leaderName}`] };
            if (language === 'HINDI') return { variations: [`${eventName} के अवसर पर आपको और आपके परिवार को हार्दिक शुभकामनाएँ। - ${leaderName}`] };
            return { variations: [`Wishing you and your family a very happy ${eventName}! - ${leaderName}`] };
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `Generate 3 short, warm, and professional campaign greeting messages for the festival/event "${eventName}" in ${language} language.
            Context: The sender is a political leader/representative named "${leaderName}".
            Audience: Constituents/Citizens.
            Style: One formal, one warm/personal, one inclusive.
            Length: Under 30 words each.
            Format: Return ONLY a JSON array of strings.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            try {
                // Strip markdown code blocks if present
                const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                const json = JSON.parse(cleanText);
                if (Array.isArray(json) && json.length > 0) {
                    return { variations: json };
                }
            } catch (e) {
                 console.warn('[CAMPAIGN] Failed to parse JSON from Gemini:', text);
            }
        } catch (error) {
            console.warn('[CAMPAIGN] Gemini API failed, falling back to templates:', error);
        }

        if (language === 'ODIA') return { variations: [`${eventName} ଉପଲକ୍ଷେ ଆପଣଙ୍କୁ ଓ ଆପଣଙ୍କ ପରିବାରକୁ ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା। - ${leaderName}`] };
        if (language === 'HINDI') return { variations: [`${eventName} के अवसर पर आपको और आपके परिवार को हार्दिक शुभकामनाएँ। - ${leaderName}`] };
        return { variations: [`Wishing you and your family a very happy ${eventName}! - ${leaderName}`] };
    }
);
