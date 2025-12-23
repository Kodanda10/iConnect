
import { Constituent, TaskType } from "../types";

// SECURITY NOTE:
// Direct API calls to Gemini from the client-side are disabled to prevent API Key leakage.
// In a production environment, these requests must be routed through a secure backend (e.g. Cloud Functions).
// See: functions/src/greeting.ts for the backend implementation.

export const generateWish = async (constituent: Constituent, type: TaskType): Promise<string> => {
    // Fallback logic (formerly used when API key was missing)
    const occasion = type === 'BIRTHDAY' ? 'Birthday' : 'Anniversary';
    return `Happy ${occasion} ${constituent.name}! Wishing you a wonderful year ahead.`;
}

export const getCampaignVariations = async (eventName: string, leaderName: string, language: 'ODIA' | 'ENGLISH' | 'HINDI'): Promise<string[]> => {
    // Fallback logic
    if (language === 'ODIA') return [`${eventName} ଉପଲକ୍ଷେ ଆପଣଙ୍କୁ ଓ ଆପଣଙ୍କ ପରିବାରକୁ ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା। - ${leaderName}`];
    if (language === 'HINDI') return [`${eventName} के अवसर पर आपको और आपके परिवार को हार्दिक शुभकामनाएँ। - ${leaderName}`];
    return [`Wishing you and your family a very happy ${eventName}! - ${leaderName}`];
}
