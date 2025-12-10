/**
 * @file lib/services/constituents.ts
 * @description Firestore service for constituent operations
 * @changelog
 * - 2024-12-11: Initial implementation with CRUD operations
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
    limit,
    startAfter,
    DocumentSnapshot,
    QueryConstraint,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Constituent } from '@/types';

const COLLECTION_NAME = 'constituents';

/**
 * Get all constituents with optional pagination
 */
export async function getConstituents(
    pageSize = 50,
    lastDoc?: DocumentSnapshot
): Promise<{ constituents: Constituent[]; lastDoc: DocumentSnapshot | null }> {
    const db = getFirebaseDb();
    const constraints: QueryConstraint[] = [
        orderBy('created_at', 'desc'),
        limit(pageSize),
    ];

    if (lastDoc) {
        constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    const constituents: Constituent[] = [];
    snapshot.forEach((doc) => {
        constituents.push({ id: doc.id, ...doc.data() } as Constituent);
    });

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    return { constituents, lastDoc: newLastDoc };
}

/**
 * Get constituent by ID
 */
export async function getConstituentById(id: string): Promise<Constituent | null> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Constituent;
    }
    return null;
}

/**
 * Search constituents by name or mobile
 */
export async function searchConstituents(
    searchTerm: string,
    field: 'name' | 'mobile_number' = 'name'
): Promise<Constituent[]> {
    const db = getFirebaseDb();

    // Firestore doesn't support LIKE queries, so we use range queries for prefix matching
    const q = query(
        collection(db, COLLECTION_NAME),
        where(field, '>=', searchTerm),
        where(field, '<=', searchTerm + '\uf8ff'),
        limit(20)
    );

    const snapshot = await getDocs(q);
    const results: Constituent[] = [];

    snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as Constituent);
    });

    return results;
}

/**
 * Add new constituent
 */
export async function addConstituent(
    data: Omit<Constituent, 'id' | 'created_at'>
): Promise<string> {
    const db = getFirebaseDb();

    // Extract day/month for efficient birthday/anniversary queries
    const dobDate = new Date(data.dob);
    const constituentData = {
        ...data,
        dob_month: dobDate.getMonth() + 1,
        dob_day: dobDate.getDate(),
        created_at: new Date().toISOString(),
    };

    if (data.anniversary) {
        const annDate = new Date(data.anniversary);
        Object.assign(constituentData, {
            anniversary_month: annDate.getMonth() + 1,
            anniversary_day: annDate.getDate(),
        });
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), constituentData);
    return docRef.id;
}

/**
 * Add multiple constituents (batch import)
 */
export async function addConstituents(
    dataArray: Omit<Constituent, 'id' | 'created_at'>[]
): Promise<string[]> {
    const ids: string[] = [];

    // Process in batches to avoid overloading
    for (const data of dataArray) {
        const id = await addConstituent(data);
        ids.push(id);
    }

    return ids;
}

/**
 * Update constituent
 */
export async function updateConstituent(
    id: string,
    data: Partial<Constituent>
): Promise<void> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, id);

    // Update day/month if dates changed
    const updateData: Record<string, unknown> = { ...data };

    if (data.dob) {
        const dobDate = new Date(data.dob);
        updateData.dob_month = dobDate.getMonth() + 1;
        updateData.dob_day = dobDate.getDate();
    }

    if (data.anniversary) {
        const annDate = new Date(data.anniversary);
        updateData.anniversary_month = annDate.getMonth() + 1;
        updateData.anniversary_day = annDate.getDate();
    }

    await updateDoc(docRef, updateData);
}

/**
 * Delete constituent
 */
export async function deleteConstituent(id: string): Promise<void> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
}

/**
 * Get constituents with birthday/anniversary on a specific date
 */
export async function getConstituentsForDate(
    month: number,
    day: number,
    type: 'birthday' | 'anniversary' = 'birthday'
): Promise<Constituent[]> {
    const db = getFirebaseDb();
    const fieldMonth = type === 'birthday' ? 'dob_month' : 'anniversary_month';
    const fieldDay = type === 'birthday' ? 'dob_day' : 'anniversary_day';

    const q = query(
        collection(db, COLLECTION_NAME),
        where(fieldMonth, '==', month),
        where(fieldDay, '==', day)
    );

    const snapshot = await getDocs(q);
    const results: Constituent[] = [];

    snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as Constituent);
    });

    return results;
}
