/**
 * @file lib/services/meeting.ts
 * @description Service for managing meeting tickers
 */

import { httpsCallable } from 'firebase/functions';
import { doc, deleteDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getFirebaseFunctions, getFirebaseDb } from '@/lib/firebase';

// Firestore timestamp type
type FirebaseTimestamp = { seconds: number; nanoseconds: number } | Date;

export interface MeetingTickerData {
    title: string;
    startTime: string; // ISO string     
    meetingType: 'VIDEO_MEET' | 'CONFERENCE_CALL';
    meetUrl?: string; // Optional for Conference
    dialInNumber?: string; // Optional for Video
    accessCode?: string; // Optional for Video
    leaderUid: string;
    // Audience Targeting
    targetAudience?: 'ALL' | 'BLOCK' | 'GP';
    targetBlock?: string;
    targetGP?: string;
}

export interface ActiveTicker {
    title: string;
    startTime: string;
    meetingType?: 'VIDEO_MEET' | 'CONFERENCE_CALL'; // Backwards compatibility
    meetUrl?: string;
    dialInNumber?: string;
    accessCode?: string;
    status: 'scheduled' | 'live' | 'concluded';
    createdAt?: FirebaseTimestamp;
}

/**
 * Create a new meeting ticker via Cloud Function
 */
export async function createMeetingTicker(data: MeetingTickerData) {
    const functions = getFirebaseFunctions();
    const createTicker = httpsCallable(functions, 'createMeetingTicker');

    try {
        const result = await createTicker(data);
        return result.data;
    } catch (error) {
        console.error('Error calling createMeetingTicker:', error);
        throw error;
    }
}

/**
 * Provision a Conference Bridge via Cloud Function
 */
export async function createConferenceBridge() {
    const functions = getFirebaseFunctions();
    const createBridge = httpsCallable(functions, 'createConferenceBridge');

    try {
        const result = await createBridge();
        return result.data as { dialInNumber: string, accessCode: string, provider: string };
    } catch (error) {
        console.error('Error calling createConferenceBridge:', error);
        throw error;
    }
}

/**
 * End a meeting manually (update status to concluded or delete)
 * Here we delete it to remove it from the mobile app ticker immediately,
 * or we could set status='concluded'. The mobile app listens to the doc.
 */
export async function endMeetingTicker(leaderUid: string) {
    const db = getFirebaseDb();
    const tickerRef = doc(db, 'active_tickers', leaderUid);

    try {
        // Option A: Delete document (removes ticker from app)
        await deleteDoc(tickerRef);
        // Option B: Set status concluded (if app handles it)
        // await updateDoc(tickerRef, { status: 'concluded' });
    } catch (error) {
        console.error('Error ending meeting ticker:', error);
        throw error;
    }
}

/**
 * Subscribe to active ticker for a leader
 */
export function subscribeToTicker(leaderUid: string, callback: (ticker: ActiveTicker | null) => void): Unsubscribe {
    const db = getFirebaseDb();
    const tickerRef = doc(db, 'active_tickers', leaderUid);

    return onSnapshot(tickerRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as ActiveTicker);
        } else {
            callback(null);
        }
    });
}
