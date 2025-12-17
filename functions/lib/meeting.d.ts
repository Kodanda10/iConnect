interface MeetingTickerData {
    title: string;
    startTime: string;
    meetingType: 'VIDEO_MEET' | 'CONFERENCE_CALL';
    meetUrl?: string;
    dialInNumber?: string;
    accessCode?: string;
    leaderUid: string;
    targetAudience?: 'ALL' | 'BLOCK' | 'GP';
    targetBlock?: string;
    targetGP?: string;
}
/**
 * Creates a new meeting ticker in Firestore.
 * Supports VIDEO_MEET and CONFERENCE_CALL types.
 */
export declare const createMeetingTicker: import("firebase-functions/v2/https").CallableFunction<MeetingTickerData, Promise<{
    success: boolean;
    message: string;
}>, unknown>;
/**
 * Mocks the creation of a Conference Bridge.
 * Returns a random Dial-In Number and Access Code.
 */
export declare const createConferenceBridge: import("firebase-functions/v2/https").CallableFunction<unknown, Promise<{
    success: boolean;
    data: {
        dialInNumber: string;
        accessCode: string;
        provider: string;
    };
}>, unknown>;
export {};
