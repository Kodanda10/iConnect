/**
 * @file lib/services/tasks.ts
 * @description Firestore service for task operations
 * @changelog
 * - 2024-12-11: Initial implementation with CRUD and enrichment
 */

import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Task, EnrichedTask, TaskStatus, TaskType, Constituent } from '@/types';
import { getConstituentById } from './constituents';

const COLLECTION_NAME = 'tasks';

/**
 * Get tasks by status and date range
 */
export async function getTasks(
    status: TaskStatus = 'PENDING',
    type?: TaskType,
    startDate?: string,
    endDate?: string
): Promise<Task[]> {
    const db = getFirebaseDb();
    const constraints = [
        where('status', '==', status),
        orderBy('due_date', 'asc'),
    ];

    if (type) {
        constraints.push(where('type', '==', type));
    }

    if (startDate) {
        constraints.push(where('due_date', '>=', startDate));
    }

    if (endDate) {
        constraints.push(where('due_date', '<=', endDate));
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    const tasks: Task[] = [];
    snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
    });

    return tasks;
}

/**
 * Get tasks for today and tomorrow (for Leader app)
 */
export async function getPendingTasks(): Promise<Task[]> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const db = getFirebaseDb();
    const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'PENDING'),
        where('due_date', 'in', [todayStr, tomorrowStr]),
        orderBy('due_date', 'asc')
    );

    const snapshot = await getDocs(q);
    const tasks: Task[] = [];

    snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
    });

    return tasks;
}

/**
 * Get enriched tasks (with constituent data joined)
 */
export async function getEnrichedTasks(
    status: TaskStatus = 'PENDING',
    type?: TaskType
): Promise<EnrichedTask[]> {
    const tasks = await getTasks(status, type);

    const enrichedTasks: EnrichedTask[] = [];

    for (const task of tasks) {
        const constituent = await getConstituentById(task.constituentId);
        if (constituent) {
            enrichedTasks.push({
                ...task,
                constituent,
            });
        }
    }

    return enrichedTasks;
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Task;
    }
    return null;
}

/**
 * Create a new task
 */
export async function createTask(
    data: Omit<Task, 'id' | 'created_at'>
): Promise<string> {
    const db = getFirebaseDb();

    const taskData = {
        ...data,
        created_at: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), taskData);
    return docRef.id;
}

/**
 * Update task (for completing tasks, adding notes, etc.)
 */
export async function updateTask(
    id: string,
    data: Partial<Task>
): Promise<void> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
}

/**
 * Complete a task with action details
 */
export async function completeTask(
    id: string,
    action: 'CALL' | 'SMS' | 'WHATSAPP',
    completedBy: 'LEADER' | 'STAFF',
    notes?: string
): Promise<void> {
    await updateTask(id, {
        status: 'COMPLETED',
        actionTaken: action,
        completedBy: completedBy,
        notes: notes || `Completed via ${action}`,
    });
}

/**
 * Get task counts for dashboard
 */
export async function getTaskCounts(): Promise<{
    pending: number;
    completed: number;
    pendingBirthdays: number;
    pendingAnniversaries: number;
}> {
    const db = getFirebaseDb();

    // Pending count
    const pendingQuery = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'PENDING')
    );
    const pendingSnapshot = await getDocs(pendingQuery);

    // Completed count
    const completedQuery = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'COMPLETED')
    );
    const completedSnapshot = await getDocs(completedQuery);

    // Birthday count
    const birthdayQuery = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'PENDING'),
        where('type', '==', 'BIRTHDAY')
    );
    const birthdaySnapshot = await getDocs(birthdayQuery);

    // Anniversary count
    const anniversaryQuery = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'PENDING'),
        where('type', '==', 'ANNIVERSARY')
    );
    const anniversarySnapshot = await getDocs(anniversaryQuery);

    return {
        pending: pendingSnapshot.size,
        completed: completedSnapshot.size,
        pendingBirthdays: birthdaySnapshot.size,
        pendingAnniversaries: anniversarySnapshot.size,
    };
}
