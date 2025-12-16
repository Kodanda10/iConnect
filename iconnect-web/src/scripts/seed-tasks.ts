/**
 * @file seed-tasks.ts
 * @description Seed script to populate Firestore with 'tasks' for mobile app testing
 * Run with: npx ts-node src/scripts/seed-tasks.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

// Firebase config
// Note: dotenv and path not needed when using hardcoded config

// Constituent type for type-safe access
interface ConstituentDoc {
    id: string;
    full_name?: string;
    name?: string;
}

const firebaseConfig = {
    apiKey: 'AIzaSyAygMgePqu-C__yOoqDyqFHgnJ5Snr4Ic8',
    authDomain: 'iconnect-crm.firebaseapp.com',
    projectId: 'iconnect-crm',
    storageBucket: 'iconnect-crm.firebasestorage.app',
    messagingSenderId: '887016822564',
    appId: '1:887016822564:web:dd5f49de3ef0138fe1c5b1',
};

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
