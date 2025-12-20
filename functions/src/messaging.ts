
import * as admin from 'firebase-admin';

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

    // REDACTION for Privacy (PII)
    // Show only last 4 digits of mobile
    const redactedMobile = mobile.length > 4
        ? '...'.padEnd(mobile.length - 4, '*') + mobile.slice(-4)
        : '***';

    console.log(`[SMS MOCK] To: ${redactedMobile} | Message: (redacted, length=${message.length})`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return true;
}
