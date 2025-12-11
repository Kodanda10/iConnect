/**
 * @file api/seed/route.ts
 * @description API route to seed 50 test constituents
 * Authenticates as admin user, then writes to Firestore with auth token
 * @changelog
 * - 2024-12-11: Initial implementation
 * - 2024-12-11: Switch to authenticated REST API seeding
 */

import { NextResponse } from 'next/server';

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

function toFirestoreTimestamp(date: Date) {
    return { timestampValue: date.toISOString() };
}

function toFirestoreString(value: string) {
    return { stringValue: value };
}

function toFirestoreArray(values: string[]) {
    return {
        arrayValue: {
            values: values.map(v => ({ stringValue: v }))
        }
    };
}

async function signInAsAdmin(apiKey: string): Promise<string | null> {
    // Sign in with email/password using Firebase Auth REST API
    const email = 'admin@admin.com';
    const password = 'admin123';

    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    const response = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
        })
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Auth error:', error);
        return null;
    }

    const data = await response.json();
    return data.idToken;
}

export async function POST() {
    try {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

        if (!projectId || !apiKey) {
            return NextResponse.json({
                success: false,
                error: 'Firebase configuration missing'
            }, { status: 500 });
        }

        // Authenticate as admin user
        const idToken = await signInAsAdmin(apiKey);
        if (!idToken) {
            return NextResponse.json({
                success: false,
                error: 'Failed to authenticate as admin. Make sure admin@admin.com user exists.'
            }, { status: 401 });
        }

        const today = new Date();
        const results = [];
        const errors = [];

        for (let i = 0; i < 50; i++) {
            const firstName = randomFrom(firstNames);
            const lastName = randomFrom(lastNames);

            // Generate birthday - some today/upcoming for testing
            let birthday: Date;
            if (i < 5) {
                birthday = new Date(1980 + Math.floor(Math.random() * 30), today.getMonth(), today.getDate());
            } else if (i < 10) {
                const daysAhead = Math.floor(Math.random() * 7) + 1;
                birthday = new Date(1980 + Math.floor(Math.random() * 30), today.getMonth(), today.getDate() + daysAhead);
            } else {
                birthday = randomDate(1950, 2000);
            }

            // Generate anniversary - some today/upcoming
            let anniversary: Date | null = null;
            if (i % 2 === 0) {
                if (i < 3) {
                    anniversary = new Date(2000 + Math.floor(Math.random() * 20), today.getMonth(), today.getDate());
                } else if (i < 6) {
                    const daysAhead = Math.floor(Math.random() * 7) + 1;
                    anniversary = new Date(2000 + Math.floor(Math.random() * 20), today.getMonth(), today.getDate() + daysAhead);
                } else {
                    anniversary = randomDate(1990, 2020);
                }
            }

            const fields: Record<string, any> = {
                first_name: toFirestoreString(firstName),
                last_name: toFirestoreString(lastName),
                full_name: toFirestoreString(`${firstName} ${lastName}`),
                phone: toFirestoreString(randomPhone()),
                block: toFirestoreString(randomFrom(blocks)),
                gp_ulb: toFirestoreString(randomFrom(gpUlbs)),
                village: toFirestoreString(randomFrom(villages)),
                ward: toFirestoreString(String(Math.floor(Math.random() * 20) + 1)),
                birthday: toFirestoreTimestamp(birthday),
                birthday_mmdd: toFirestoreString(formatDateMMDD(birthday)),
                tags: toFirestoreArray(['seeded']),
                created_at: toFirestoreTimestamp(new Date()),
                updated_at: toFirestoreTimestamp(new Date()),
            };

            if (anniversary) {
                fields.anniversary = toFirestoreTimestamp(anniversary);
                fields.anniversary_mmdd = toFirestoreString(formatDateMMDD(anniversary));
            }

            // Use Firestore REST API with auth token
            const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/constituents`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ fields }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Firestore error for ${firstName}:`, errorData);
                errors.push({ name: `${firstName} ${lastName}`, error: errorData.error?.message || 'Unknown error' });
                continue;
            }

            const data = await response.json();
            const docId = data.name?.split('/').pop();
            results.push({ id: docId, name: `${firstName} ${lastName}` });
        }

        return NextResponse.json({
            success: true,
            message: `Created ${results.length} constituents (${errors.length} errors)`,
            data: results,
            errors: errors.length > 0 ? errors.slice(0, 5) : undefined
        });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
