/**
 * @file lib/services/settings.ts
 * @description Firestore service for app settings (singleton document)
 * @changelog
 * - 2024-12-11: Initial implementation
 */

import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseDb, getFirebaseStorage } from '@/lib/firebase';
import { AppSettings } from '@/types';

const COLLECTION_NAME = 'settings';
const DOC_ID = 'app_config';

const DEFAULT_SETTINGS: AppSettings = {
    appName: 'iConnect',
    leaderName: 'Political Leader',
    alertSettings: {
        headsUp: true,
        action: true,
    },
};

/**
 * Get app settings
 */
export async function getSettings(): Promise<AppSettings> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
        return snapshot.data() as AppSettings;
    }

    // Create default settings if not exists
    await setDoc(docRef, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
}

/**
 * Subscribe to settings changes (real-time updates)
 */
export function subscribeToSettings(
    callback: (settings: AppSettings) => void
): () => void {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data() as AppSettings);
        } else {
            callback(DEFAULT_SETTINGS);
        }
    });

    return unsubscribe;
}

/**
 * Update app settings
 */
export async function updateSettings(
    data: Partial<AppSettings>
): Promise<void> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);

    // Check if document exists
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        await updateDoc(docRef, data);
    } else {
        await setDoc(docRef, { ...DEFAULT_SETTINGS, ...data });
    }
}

/**
 * Upload header image and update settings
 */
export async function uploadHeaderImage(file: File): Promise<string> {
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, `images/header_${Date.now()}.jpg`);

    // Upload file
    await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Update settings with new URL
    await updateSettings({ headerImageUrl: downloadURL });

    return downloadURL;
}

/**
 * Upload profile picture and update settings
 */
export async function uploadProfilePicture(file: File): Promise<string> {
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, `images/profile_${Date.now()}.jpg`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    await updateSettings({ profilePictureUrl: downloadURL });

    return downloadURL;
}
