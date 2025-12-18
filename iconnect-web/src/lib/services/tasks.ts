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
    getCountFromServer,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Task, EnrichedTask, TaskStatus, TaskType, Constituent, ActionType, CompletedBy } from '@/types';
import { getConstituentById } from './constituents';

const COLLECTION_NAME = 'tasks';

/**
 * Get tasks by status and date range
 */
export async function getTasks(
    status: TaskStatus = 'PENDING',
    type?: TaskType,
    startDate?: Date,
    endDate?: Date
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
        constraints.push(where('due_date', '>=', Timestamp.fromDate(startDate)));
    }

    if (endDate) {
        constraints.push(where('due_date', '<=', Timestamp.fromDate(endDate)));
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
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const db = getFirebaseDb();
    const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'PENDING'),
        where('due_date', 'in', [
            Timestamp.fromDate(today),
            Timestamp.fromDate(tomorrow)
        ]),
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
        // Optimization: Check for denormalized data first
        if (task.constituent_name && task.constituent_mobile) {
            enrichedTasks.push({
                ...task,
                constituent: {
                    id: task.constituent_id,
                    name: task.constituent_name,
                    mobile_number: task.constituent_mobile,
                    ward_number: task.ward_number,
                } as Constituent
            });
            continue;
        }

        // Fallback: Fetch constituent details if not denormalized
        const constituent = await getConstituentById(task.constituent_id);
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

    // Ensure due_date is converted to Timestamp if it's a Date
    const dueDate = data.due_date instanceof Date
        ? Timestamp.fromDate(data.due_date)
        : data.due_date;

    const taskData = {
        ...data,
        due_date: dueDate,
        created_at: Timestamp.now(),
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
    action: ActionType,
    completedBy: CompletedBy,
    notes?: string
): Promise<void> {
    const actionKey = action.toLowerCase() === 'whatsapp' ? 'whatsapp_sent' : `${action.toLowerCase()}_sent`;

    await updateTask(id, {
        status: 'COMPLETED',
        action_taken: action,
        completed_by: completedBy,
        [actionKey]: true,
        [`${actionKey}_at`]: Timestamp.now(),
        notes: notes || `Completed via ${action}`,
        updated_at: Timestamp.now(),
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

    // O(1) Optimization: Using getCountFromServer
    const pendingQuery = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'PENDING')
    );
    const pendingCount = (await getCountFromServer(pendingQuery)).data().count;

    const completedQuery = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'COMPLETED')
    );
    const completedCount = (await getCountFromServer(completedQuery)).data().count;

    const birthdayQuery = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'PENDING'),
        where('type', '==', 'BIRTHDAY')
    );
    const birthdayCount = (await getCountFromServer(birthdayQuery)).data().count;

    const anniversaryQuery = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'PENDING'),
        where('type', '==', 'ANNIVERSARY')
    );
    const anniversaryCount = (await getCountFromServer(anniversaryQuery)).data().count;

    return {
        pending: pendingCount,
        completed: completedCount,
        pendingBirthdays: birthdayCount,
        pendingAnniversaries: anniversaryCount,
    };
}
