
import { GoogleGenAI, Type } from "@google/genai";
import { Constituent, TaskType } from "../types";

const getClient = () => {
    // NOTE: In a production app, the key would be in process.env.API_KEY
    const apiKey = process.env.API_KEY; 
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
}

export const generateWish = async (constituent: Constituent, type: TaskType): Promise<string> => {
    const ai = getClient();
    if (!ai) {
        // Fallback if no API key
        return `Happy ${type === 'BIRTHDAY' ? 'Birthday' : 'Anniversary'} ${constituent.name}! Wishing you a wonderful year ahead.`;
    }

    const occasion = type === 'BIRTHDAY' ? 'Birthday' : 'Wedding Anniversary';
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a short, warm, and professional ${occasion} wish message for a constituent named "${constituent.name}". 
            Context: I am their political representative/leader. 
            They live in "${constituent.address}".
            Keep it under 30 words. 
            Do not use hashtags.
            Tone: Friendly, Respectful, Connecting.`
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Gemini Error:", error);
         return `Happy ${type === 'BIRTHDAY' ? 'Birthday' : 'Anniversary'} ${constituent.name}! Best wishes from your representative.`;
    }
}

export const getCampaignVariations = async (eventName: string, leaderName: string, language: 'ODIA' | 'ENGLISH' | 'HINDI'): Promise<string[]> => {
    const ai = getClient();
    
    // Fallback if no API key
    if (!ai) {
        if (language === 'ODIA') return [`${eventName} ଉପଲକ୍ଷେ ଆପଣଙ୍କୁ ଓ ଆପଣଙ୍କ ପରିବାରକୁ ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା। - ${leaderName}`];
        if (language === 'HINDI') return [`${eventName} के अवसर पर आपको और आपके परिवार को हार्दिक शुभकामनाएँ। - ${leaderName}`];
        return [`Wishing you and your family a very happy ${eventName}! - ${leaderName}`];
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 3 short, warm, and professional campaign greeting messages for the festival/event "${eventName}" in ${language} language.
            Context: The sender is a political leader/representative named "${leaderName}".
            Audience: Constituents/Citizens.
            Style: One formal, one warm/personal, one inclusive.
            Length: Under 30 words each.
            Format: Return ONLY a JSON array of strings.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        const json = JSON.parse(response.text || '[]');
        return json;
    } catch (error) {
        console.error("Gemini Campaign Gen Error:", error);
        if (language === 'ODIA') return [`${eventName} ଉପଲକ୍ଷେ ଆପଣଙ୍କୁ ଓ ଆପଣଙ୍କ ପରିବାରକୁ ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା। - ${leaderName}`];
        if (language === 'HINDI') return [`${eventName} के अवसर पर आपको और आपके परिवार को हार्दिक शुभकामनाएँ। - ${leaderName}`];
        return [`Wishing you and your family a very happy ${eventName}! - ${leaderName}`];
    }
}
