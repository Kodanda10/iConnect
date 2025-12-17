/**
 * Logic to handle new meeting creation
 * - Calculates notification schedule
 * - Sends immediate confirmation to creator
 * - Sends SMS/WhatsApp to all constituents
 */
export declare function handleMeetingCreated(meetingData: any): Promise<void>;
/**
 * Firestore Trigger: Run when a new document is added to 'scheduled_meetings'
 */
export declare const onMeetingCreated: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    meetingId: string;
}>>;
