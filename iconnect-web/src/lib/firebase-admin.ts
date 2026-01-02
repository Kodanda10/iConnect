/**
 * @file lib/firebase-admin.ts
 * @description Firebase Admin SDK initialization for server-side operations
 * @changelog
 * - 2024-12-11: Initial implementation for server-side operations
 */

import 'server-only';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

/**
 * Get or initialize Firebase Admin app
 * Uses GOOGLE_APPLICATION_CREDENTIALS or falls back to project ID only
 */
export function getAdminApp(): App {
    if (!adminApp) {
        const apps = getApps();
        if (apps.length > 0) {
            adminApp = apps[0];
        } else {
            // Try to use service account credentials if available
            const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;

            if (serviceAccount) {
                try {
                    const parsedAccount = JSON.parse(serviceAccount);
                    adminApp = initializeApp({
                        credential: cert(parsedAccount),
                        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    });
                } catch (e) {
                    console.warn('Failed to parse service account, using default init');
                    adminApp = initializeApp({
                        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    });
                }
            } else {
                // Fall back to default initialization (works in GCP environments)
                adminApp = initializeApp({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                });
            }
        }
    }
    return adminApp;
}

/**
 * Get Firestore Admin instance (bypasses security rules)
 */
export function getAdminDb(): Firestore {
    if (!adminDb) {
        adminDb = getFirestore(getAdminApp());
    }
    return adminDb;
}
