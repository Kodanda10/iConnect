
import { Constituent, TaskType } from "../types";

export const generateWish = async (constituent: Constituent, type: TaskType): Promise<string> => {
    // SECURITY FIX: Removed client-side @google/genai and process.env.API_KEY exposure.
    // Client should use Cloud Functions for AI requests.
    return `Happy ${type === 'BIRTHDAY' ? 'Birthday' : 'Anniversary'} ${constituent.name}! Wishing you a wonderful year ahead.`;
}

export const getCampaignVariations = async (eventName: string, leaderName: string, language: 'ODIA' | 'ENGLISH' | 'HINDI'): Promise<string[]> => {
    // SECURITY FIX: Removed client-side @google/genai and process.env.API_KEY exposure.
    if (language === 'ODIA') return [`${eventName} ଉପଲକ୍ଷେ ଆପଣଙ୍କୁ ଓ ଆପଣଙ୍କ ପରିବାରକୁ ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା। - ${leaderName}`];
    if (language === 'HINDI') return [`${eventName} के अवसर पर आपको और आपके परिवार को हार्दिक शुभकामनाएँ। - ${leaderName}`];
    return [`Wishing you and your family a very happy ${eventName}! - ${leaderName}`];
}
