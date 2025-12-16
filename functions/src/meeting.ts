import { onCall, CallableRequest, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

// Ensure Admin SDK is initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

interface MeetingTickerData {
    title: string;
    startTime: string;
    meetingType: 'VIDEO_MEET' | 'CONFERENCE_CALL';
    meetUrl?: string;
    dialInNumber?: string;
    accessCode?: string;
    leaderUid: string;
}

/**
 * Creates a new meeting ticker in Firestore.
 * Supports VIDEO_MEET and CONFERENCE_CALL types.
 */
export const createMeetingTicker = onCall(
    { region: "asia-south1" },
    async (request: CallableRequest<MeetingTickerData>) => {
        const data = request.data;
        const {
            title,
            startTime,
            meetingType, // 'VIDEO_MEET' | 'CONFERENCE_CALL'
            meetUrl,
            dialInNumber,
            accessCode,
            leaderUid
        } = data;

        if (!data.title || !data.startTime || !data.leaderUid || !data.meetingType) {
            throw new HttpsError(
                "invalid-argument",
                "Missing required fields: title, startTime, meetingType, leaderUid"
            );
        }

        try {
            const tickerRef = admin.firestore().collection("active_tickers").doc(leaderUid);

            const tickerData: any = {
                title,
                startTime: admin.firestore.Timestamp.fromDate(new Date(startTime)), // Ensure Timestamp
                meetingType,
                status: "scheduled",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            // Conditional fields based on type
            if (meetingType === 'VIDEO_MEET') {
                tickerData.meetUrl = meetUrl || "";
            } else if (meetingType === 'CONFERENCE_CALL') {
                tickerData.dialInNumber = dialInNumber || "";
                tickerData.accessCode = accessCode || "";
            }

            await tickerRef.set(tickerData);

            console.log(`Ticker created for leader ${leaderUid} [${meetingType}]`);

            // Placeholder: Broadcast Notification Logic (BCG) would go here
            // if (meetingType === 'CONFERENCE_CALL') { sendSMS(...) }

            return { success: true, message: "Ticker created successfully." };

        } catch (error) {
            console.error("Error creating meeting ticker:", error);
            throw new HttpsError("internal", "Failed to create meeting ticker");
        }
    });

/**
 * Mocks the creation of a Conference Bridge.
 * Returns a random Dial-In Number and Access Code.
 */
export const createConferenceBridge = onCall(
    { region: "asia-south1" },
    async (_request: CallableRequest<unknown>) => {
        // In production, this would call Twilio / Zoom / Provider API

        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 800));

        // Generate Mock Data
        const mockDialIn = "+91" + Math.floor(6000000000 + Math.random() * 3000000000).toString();
        const mockAccessCode = Math.floor(1000 + Math.random() * 9000).toString();

        return {
            success: true,
            data: {
                dialInNumber: mockDialIn,
                accessCode: mockAccessCode,
                provider: "MockBridge Provider v1"
            }
        };
    });
