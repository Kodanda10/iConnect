/**
 * @file seed-tasks.ts
 * @description Seed script to populate Firestore with 'tasks' for mobile app testing
 * Run with: npx ts-node src/scripts/seed-tasks.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Firebase config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Constituent type for type-safe access
interface ConstituentDoc {
    id: string;
    full_name?: string;
    name?: string;
}

async function seedTasks() {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('Fetching constituents to create tasks for...');
    const constituentsSnapshot = await getDocs(collection(db, 'constituents'));
    const constituents = constituentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (constituents.length === 0) {
        console.error('No constituents found! Run seed-constituents.ts first.');
        process.exit(1);
    }

    console.log(`Found ${constituents.length} constituents. Creating tasks...`);
    let count = 0;

    for (const constituent of constituents) {
        // Create a fake task for each constituent
        // 50% chance of 'BIRTHDAY' type, 50% 'ANNIVERSARY'
        // Due date: Today or Tomorrow for visibility
        const isBirthday = Math.random() > 0.5;
        const type = isBirthday ? 'BIRTHDAY' : 'ANNIVERSARY';

        // Random date within next 3 days to match "Pending" query
        const daysToAdd = Math.floor(Math.random() * 3); // 0, 1, 2
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysToAdd);

        // Ensure "Pending" status
        const task = {
            constituentId: constituent.id,
            type: type,
            status: 'PENDING',
            dueDate: Timestamp.fromDate(dueDate),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            // Flattened fields for easier query if needed (optional)
            constituentName: (constituent as ConstituentDoc).full_name || (constituent as ConstituentDoc).name || 'Unknown',
        };

        try {
            await addDoc(collection(db, 'tasks'), task);
            count++;
            if (count % 10 === 0) process.stdout.write('.');
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    console.log(`\nSuccessfully created ${count} tasks.`);
    process.exit(0);
}

seedTasks().catch(console.error);
