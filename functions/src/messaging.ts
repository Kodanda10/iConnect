
import * as admin from 'firebase-admin';
import { redactPhoneNumber, redactMessageContent } from './utils/security';

export async function sendPushNotification(token: string, title: string, body: string): Promise<string> {
    try {
        const message = {
            notification: {
                title,
                body
            },
            token
        };
        const response = await admin.messaging().send(message);
        return response;
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
}

export async function sendSMS(mobile: string, message: string): Promise<boolean> {
    // MOCK IMPLEMENTATION for Initial Rollout
    // In production, integrate with Twilio / msg91
    console.log(`[SMS MOCK] To: ${redactPhoneNumber(mobile)} | Message: ${redactMessageContent(message)}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return true;
}
