/**
 * @file seed-constituents.ts
 * @description Seed script to populate Firestore with 50 test constituents
 * Run with: npx ts-node src/scripts/seed-constituents.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase config from environment
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Sample data
const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anjali', 'Suresh', 'Kavita', 'Ravi', 'Meena', 'Anil', 'Pooja', 'Deepak', 'Nisha', 'Manoj', 'Rekha', 'Sanjay', 'Geeta', 'Ashok', 'Shobha'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Joshi', 'Mishra', 'Yadav', 'Reddy', 'Nair', 'Iyer', 'Rao', 'Pandey'];
const villages = ['Raipur', 'Bilaspur', 'Durg', 'Bhilai', 'Korba', 'Rajnandgaon', 'Jagdalpur', 'Ambikapur', 'Kawardha', 'Dhamtari'];
const occupations = ['Farmer', 'Teacher', 'Shop Owner', 'Government Employee', 'Doctor', 'Lawyer', 'Engineer', 'Businessman', 'Retired', 'Laborer'];

function randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
    return `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`;
}

function randomDate(startYear: number, endYear: number): Date {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDateForBirthday(date: Date): string {
    // Format as MM-DD for matching (ignore year for birthday matching)
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
}

async function seedConstituents() {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('Seeding 50 constituents...');

    const today = new Date();
    const constituents = [];

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
            birthday = new Date(1980 + Math.floor(Math.random() * 30), today.getMonth(), today.getDate() + daysAhead);
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
                anniversary = new Date(2000 + Math.floor(Math.random() * 20), today.getMonth(), today.getDate() + daysAhead);
            } else {
                anniversary = randomDate(1990, 2020);
            }
        }

        const constituent = {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            phone: randomPhone(),
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            village: randomFrom(villages),
            occupation: randomFrom(occupations),
            birthday: Timestamp.fromDate(birthday),
            birthday_mmdd: formatDateForBirthday(birthday),
            ...(anniversary && {
                anniversary: Timestamp.fromDate(anniversary),
                anniversary_mmdd: formatDateForBirthday(anniversary)
            }),
            tags: ['test-data'],
            notes: `Test constituent #${i + 1}`,
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
        };

        try {
            const docRef = await addDoc(collection(db, 'constituents'), constituent);
            console.log(`Created: ${constituent.full_name} (${docRef.id})`);
            constituents.push(constituent);
        } catch (error) {
            console.error(`Failed to create ${constituent.full_name}:`, error);
        }
    }

    console.log(`\\nSeeding complete! Created ${constituents.length} constituents.`);
    console.log(`- ${constituents.filter(c => c.birthday_mmdd === formatDateForBirthday(today)).length} birthdays today`);
    process.exit(0);
}

seedConstituents().catch(console.error);
