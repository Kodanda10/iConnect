export interface CampaignRequest {
    eventName: string;
    leaderName: string;
    language: 'ODIA' | 'ENGLISH' | 'HINDI';
}
export declare const generateCampaignVariations: import("firebase-functions/v2/https").CallableFunction<CampaignRequest, any, unknown>;
