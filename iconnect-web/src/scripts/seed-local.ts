/**
 * @file scripts/seed-local.ts
 * @description Local script to seed 50 test constituents directly to Firestore
 * Run with: npx ts-node --esm src/scripts/seed-local.ts
 * @changelog
 * - 2024-12-11: Created for local seeding (bypasses Vercel auth)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin (uses default credentials or service account)
const app = initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'project-iconnectapp',
});


const db = getFirestore(app);

// Sample data
const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anjali', 'Suresh', 'Kavita', 'Ravi', 'Meena', 'Anil', 'Pooja', 'Deepak', 'Nisha', 'Manoj', 'Rekha', 'Sanjay', 'Geeta', 'Ashok', 'Shobha'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Joshi', 'Mishra', 'Yadav', 'Reddy', 'Nair', 'Iyer', 'Rao', 'Pandey'];
const villages = ['Raipur', 'Bilaspur', 'Durg', 'Bhilai', 'Korba', 'Rajnandgaon', 'Jagdalpur', 'Ambikapur', 'Kawardha', 'Dhamtari'];
const blocks = ['Raipur', 'Bilaspur', 'Durg', 'Korba', 'Rajnandgaon'];
const gpUlbs = ['GP1', 'GP2', 'GP3', 'ULB1', 'ULB2'];

function randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
    return `${Math.floor(7000000000 + Math.random() * 2999999999)}`;
}

function randomDate(startYear: number, endYear: number): Date {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDateMMDD(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
}

async function seedConstituents() {
    const today = new Date();
    const results = [];

    console.log('🚀 Starting to seed 50 constituents...');

    for (let i = 0; i < 50; i++) {
        const firstName = randomFrom(firstNames);
        const lastName = randomFrom(lastNames);

        // Generate birthday - some today/upcoming for testing
        let birthday: Date;
        if (i < 5) {
            // First 5: birthday today
            birthday = new Date(1980 + Math.floor(Math.random() * 30), today.getMonth(), today.getDate());
        } else if (i < 10) {
            // Next 5: birthday within a week
            const daysAhead = Math.floor(Math.random() * 7) + 1;
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + daysAhead);
            birthday = new Date(1980 + Math.floor(Math.random() * 30), futureDate.getMonth(), futureDate.getDate());
        } else {
            // Rest: random
            birthday = randomDate(1950, 2000);
        }

        // Generate anniversary - some today/upcoming for testing
        let anniversary: Date | null = null;
        if (i % 2 === 0) { // 50% have anniversary
            if (i < 3) {
                anniversary = new Date(2000 + Math.floor(Math.random() * 20), today.getMonth(), today.getDate());
            } else if (i < 6) {
                const daysAhead = Math.floor(Math.random() * 7) + 1;
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate() + daysAhead);
                anniversary = new Date(2000 + Math.floor(Math.random() * 20), futureDate.getMonth(), futureDate.getDate());
            } else {
                anniversary = randomDate(1990, 2020);
            }
        }

        const constituent = {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            phone: randomPhone(),
            block: randomFrom(blocks),
            gp_ulb: randomFrom(gpUlbs),
            village: randomFrom(villages),
            ward: String(Math.floor(Math.random() * 20) + 1),
            birthday: Timestamp.fromDate(birthday),
            birthday_mmdd: formatDateMMDD(birthday),
            ...(anniversary && {
                anniversary: Timestamp.fromDate(anniversary),
                anniversary_mmdd: formatDateMMDD(anniversary)
            }),
            tags: ['seeded'],
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
        };

        const docRef = await db.collection('constituents').add(constituent);
        results.push({ id: docRef.id, name: constituent.full_name });
        console.log(`  ✅ Created: ${constituent.full_name} (${i + 1}/50)`);
    }

    console.log(`\n🎉 Successfully seeded ${results.length} constituents!`);
    console.log(`   - ${results.filter((_, i) => i < 5).length} with birthday TODAY`);
    console.log(`   - ${results.filter((_, i) => i >= 5 && i < 10).length} with birthday THIS WEEK`);
    console.log(`   - ${Math.floor(results.length / 2)} with anniversaries`);

    process.exit(0);
}

seedConstituents().catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
});
