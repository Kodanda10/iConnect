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
    // Audience Targeting
    targetAudience?: 'ALL' | 'BLOCK' | 'GP';
    targetBlock?: string;
    targetGP?: string;
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

        // Security: Start
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "User must be authenticated.");
        }

        // RBAC: Only Leaders can create meetings
        const callerRole = request.auth.token.role;
        if (callerRole !== 'LEADER') {
            throw new HttpsError("permission-denied", "Only Leaders can create meetings.");
        }

        if (leaderUid !== request.auth.uid) {
            throw new HttpsError("permission-denied", "Cannot create meeting for another leader.");
        }
        // Security: End

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

                // Store audience targeting info
                tickerData.targetAudience = data.targetAudience || 'ALL';
                if (data.targetBlock) tickerData.targetBlock = data.targetBlock;
                if (data.targetGP) tickerData.targetGP = data.targetGP;
            }

            await tickerRef.set(tickerData);

            console.log(`Ticker created for leader ${leaderUid} [${meetingType}]`);

            // === BROADCAST TRIGGER (Conference Calls Only) ===
            if (meetingType === 'CONFERENCE_CALL') {
                const { queryConstituentsByAudience, sendBulkSMS } = await import('./audienceQuery');
                const { formatAudioMessage, schedulePushForLeader } = await import('./notifications');

                const targetAudience = data.targetAudience || 'ALL';
                const targetBlock = data.targetBlock;
                const targetGP = data.targetGP;

                // 1. Query constituents based on audience targeting
                const constituents = await queryConstituentsByAudience(
                    targetAudience,
                    targetBlock,
                    targetGP
                );

                // 2. Send bulk SMS with dial-in details
                const message = formatAudioMessage({
                    dialInNumber: dialInNumber || '',
                    accessCode: accessCode || '',
                }, 'HINDI');

                await sendBulkSMS(constituents, message);

                // 3. Schedule push notifications for Leader
                await schedulePushForLeader(leaderUid, title, new Date(startTime));

                console.log(`[BROADCAST] SMS sent to ${constituents.length} constituents, push notifications scheduled`);
            }

            return { success: true, message: "Ticker created and broadcast initiated." };

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
    async (request: CallableRequest<unknown>) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "User must be authenticated.");
        }

        // RBAC: Only Leaders can create conference bridges
        const callerRole = request.auth.token.role;
        if (callerRole !== 'LEADER') {
            throw new HttpsError("permission-denied", "Only Leaders can create conference bridges.");
        }

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
