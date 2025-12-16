"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConferenceBridge = exports.createMeetingTicker = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
// Ensure Admin SDK is initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
/**
 * Creates a new meeting ticker in Firestore.
 * Supports VIDEO_MEET and CONFERENCE_CALL types.
 */
exports.createMeetingTicker = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    const data = request.data;
    const { title, startTime, meetingType, // 'VIDEO_MEET' | 'CONFERENCE_CALL'
    meetUrl, dialInNumber, accessCode, leaderUid } = data;
    if (!data.title || !data.startTime || !data.leaderUid || !data.meetingType) {
        throw new https_1.HttpsError("invalid-argument", "Missing required fields: title, startTime, meetingType, leaderUid");
    }
    try {
        const tickerRef = admin.firestore().collection("active_tickers").doc(leaderUid);
        const tickerData = {
            title,
            startTime: admin.firestore.Timestamp.fromDate(new Date(startTime)), // Ensure Timestamp
            meetingType,
            status: "scheduled",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        // Conditional fields based on type
        if (meetingType === 'VIDEO_MEET') {
            tickerData.meetUrl = meetUrl || "";
        }
        else if (meetingType === 'CONFERENCE_CALL') {
            tickerData.dialInNumber = dialInNumber || "";
            tickerData.accessCode = accessCode || "";
        }
        await tickerRef.set(tickerData);
        console.log(`Ticker created for leader ${leaderUid} [${meetingType}]`);
        // Placeholder: Broadcast Notification Logic (BCG) would go here
        // if (meetingType === 'CONFERENCE_CALL') { sendSMS(...) }
        return { success: true, message: "Ticker created successfully." };
    }
    catch (error) {
        console.error("Error creating meeting ticker:", error);
        throw new https_1.HttpsError("internal", "Failed to create meeting ticker");
    }
});
/**
 * Mocks the creation of a Conference Bridge.
 * Returns a random Dial-In Number and Access Code.
 */
exports.createConferenceBridge = (0, https_1.onCall)({ region: "asia-south1" }, async (_request) => {
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
//# sourceMappingURL=meeting.js.map