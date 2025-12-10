/**
 * @file lib/services/festivals.ts
 * @description Firestore service for festival and campaign management
 * @changelog
 * - 2024-12-11: Initial implementation
 */

import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Festival } from '@/types';

const COLLECTION_NAME = 'festivals';

/**
 * Get all festivals
 */
export async function getFestivals(): Promise<Festival[]> {
    const db = getFirebaseDb();
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'asc'));
    const snapshot = await getDocs(q);

    const festivals: Festival[] = [];
    snapshot.forEach((doc) => {
        festivals.push({ id: doc.id, ...doc.data() } as Festival);
    });

    return festivals;
}

/**
 * Get upcoming festivals (next 30 days)
 */
export async function getUpcomingFestivals(): Promise<Festival[]> {
    const db = getFirebaseDb();
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

    const q = query(
        collection(db, COLLECTION_NAME),
        where('date', '>=', today),
        where('date', '<=', thirtyDaysLater),
        orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    const festivals: Festival[] = [];

    snapshot.forEach((doc) => {
        festivals.push({ id: doc.id, ...doc.data() } as Festival);
    });

    return festivals;
}

/**
 * Get festival by ID
 */
export async function getFestivalById(id: string): Promise<Festival | null> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Festival;
    }
    return null;
}

/**
 * Add new festival
 */
export async function addFestival(
    data: Omit<Festival, 'id'>
): Promise<string> {
    const db = getFirebaseDb();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return docRef.id;
}

/**
 * Update festival
 */
export async function updateFestival(
    id: string,
    data: Partial<Festival>
): Promise<void> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
}

/**
 * Delete festival
 */
export async function deleteFestival(id: string): Promise<void> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
}

// Default festivals for India
export const DEFAULT_FESTIVALS: Omit<Festival, 'id'>[] = [
    { name: 'Makar Sankranti', date: '2025-01-14', description: 'Harvest festival' },
    { name: 'Republic Day', date: '2025-01-26', description: 'National holiday' },
    { name: 'Maha Shivaratri', date: '2025-02-26', description: 'Hindu festival' },
    { name: 'Holi', date: '2025-03-14', description: 'Festival of colors' },
    { name: 'Raja Parba', date: '2025-06-14', description: 'Odia festival' },
    { name: 'Independence Day', date: '2025-08-15', description: 'National holiday' },
    { name: 'Nuakhai', date: '2025-09-08', description: 'Odia harvest festival' },
    { name: 'Durga Puja', date: '2025-10-01', description: 'Major Hindu festival' },
    { name: 'Diwali', date: '2025-10-20', description: 'Festival of lights' },
];
