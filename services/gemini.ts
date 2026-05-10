
import { Constituent, TaskType } from "../types";

import { getFunctions, httpsCallable } from 'firebase/functions';

export const generateWish = async (constituent: Constituent, type: TaskType, language: 'ODIA' | 'ENGLISH' | 'HINDI' = 'ODIA', leaderName?: string): Promise<string> => {
    // NOTE: Requires a Firebase App to be initialized before calling this
    try {
        const functions = getFunctions();
        const generateGreetingFn = httpsCallable(functions, 'generateGreeting');
        const result = await generateGreetingFn({
            name: constituent.name,
            type: type,
            language: language,
            ward: constituent.ward,
            leaderName: leaderName
        }) as { data: { greeting: string } };
        return result.data.greeting;
    } catch (error) {
        console.error("Cloud Function generateGreeting Error:", error);
        return `Happy ${type === 'BIRTHDAY' ? 'Birthday' : 'Anniversary'} ${constituent.name}! Best wishes from your representative.`;
    }
}

export const getCampaignVariations = async (eventName: string, leaderName: string, language: 'ODIA' | 'ENGLISH' | 'HINDI'): Promise<string[]> => {
    try {
        const functions = getFunctions();
        const generateCampaignVariationsFn = httpsCallable(functions, 'generateCampaignVariations');
        const result = await generateCampaignVariationsFn({
            eventName,
            leaderName,
            language
        }) as { data: { variations: string[] } };
        return result.data.variations;
    } catch (error) {
        console.error("Cloud Function generateCampaignVariations Error:", error);
        if (language === 'ODIA') return [`${eventName} ଉପଲକ୍ଷେ ଆପଣଙ୍କୁ ଓ ଆପଣଙ୍କ ପରିବାରକୁ ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା। - ${leaderName}`];
        if (language === 'HINDI') return [`${eventName} के अवसर पर आपको और आपके परिवार को हार्दिक शुभकामनाएँ। - ${leaderName}`];
        return [`Wishing you and your family a very happy ${eventName}! - ${leaderName}`];
    }
}
