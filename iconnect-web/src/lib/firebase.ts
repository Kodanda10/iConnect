/**
 * @file lib/firebase.ts
 * @description Firebase client initialization
 * @changelog
 * - 2024-12-11: Initial implementation
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

// Firebase configuration - loaded from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

/**
 * Get or initialize Firebase app
 */
export function getFirebaseApp(): FirebaseApp {
    if (!app) {
        const apps = getApps();
        if (apps.length > 0) {
            app = apps[0];
        } else {
            app = initializeApp(firebaseConfig);
        }
    }
    return app;
}

/**
 * Get Firebase Auth instance
 */
export function getFirebaseAuth(): Auth {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
    }
    return auth;
}

/**
 * Get Firestore instance
 */
export function getFirebaseDb(): Firestore {
    if (!db) {
        db = getFirestore(getFirebaseApp());
    }
    return db;
}

/**
 * Get Firebase Storage instance
 */
export function getFirebaseStorage(): FirebaseStorage {
    if (!storage) {
        storage = getStorage(getFirebaseApp());
    }
    return storage;
}

/**
 * Get Firebase Functions instance
 */
export function getFirebaseFunctions(): Functions {
    if (!functions) {
        functions = getFunctions(getFirebaseApp(), 'asia-south1');
    }
    return functions;
}

// Export for convenience
export { app, auth, db, storage, functions };
