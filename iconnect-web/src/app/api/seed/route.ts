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

        // Dec 12-16 2024 synthetic data with complete fields
        const decemberData = [
            // Dec 12 - TODAY (Birthdays)
            { name: 'Rajesh Sharma', mobile: '9876543210', whatsapp: '9876543210', dob: '1985-12-12', block: 'Raipur', gp_ulb: 'GP1', ward: '1' },
            { name: 'Priya Verma', mobile: '8765432109', whatsapp: '8765432109', dob: '1990-12-12', block: 'Bilaspur', gp_ulb: 'GP2', ward: '2' },
            { name: 'Amit Patel', mobile: '7654321098', dob: '1988-12-12', block: 'Durg', gp_ulb: 'ULB1', ward: '3' },

            // Dec 12 - TODAY (Anniversaries)
            { name: 'Sunita Singh', mobile: '6543210987', anniversary: '2010-12-12', dob: '1982-05-20', block: 'Korba', gp_ulb: 'GP1', ward: '4' },
            { name: 'Vikram Kumar', mobile: '9543210876', whatsapp: '9543210876', anniversary: '2015-12-12', block: 'Rajnandgaon', gp_ulb: 'GP2', ward: '5' },

            // Dec 13 - TOMORROW (Birthdays for Heads Up)
            { name: 'Anjali Gupta', mobile: '8543219876', whatsapp: '8543219876', dob: '1995-12-13', block: 'Raipur', gp_ulb: 'ULB1', ward: '6' },
            { name: 'Suresh Agarwal', mobile: '7543218765', dob: '1980-12-13', block: 'Bilaspur', gp_ulb: 'GP1', ward: '7' },
            { name: 'Kavita Joshi', mobile: '6543217654', whatsapp: '6543217654', dob: '1992-12-13', block: 'Durg', gp_ulb: 'GP2', ward: '8' },

            // Dec 13 - TOMORROW (Anniversaries for Heads Up)
            { name: 'Ravi Mishra', mobile: '9443216543', anniversary: '2008-12-13', dob: '1978-03-15', block: 'Korba', gp_ulb: 'ULB2', ward: '9' },
            { name: 'Meena Yadav', mobile: '8443215432', whatsapp: '8443215432', anniversary: '2012-12-13', block: 'Rajnandgaon', gp_ulb: 'GP1', ward: '10' },

            // Dec 14 (Birthdays)
            { name: 'Anil Reddy', mobile: '7443214321', whatsapp: '7443214321', dob: '1987-12-14', block: 'Raipur', gp_ulb: 'GP2', ward: '11' },
            { name: 'Pooja Nair', mobile: '6443213210', dob: '1993-12-14', block: 'Bilaspur', gp_ulb: 'ULB1', ward: '12' },

            // Dec 14 (Anniversaries)
            { name: 'Deepak Iyer', mobile: '9343212109', anniversary: '2005-12-14', dob: '1975-08-10', block: 'Durg', gp_ulb: 'GP1', ward: '13' },

            // Dec 15 (Birthdays)
            { name: 'Nisha Rao', mobile: '8343211098', whatsapp: '8343211098', dob: '1991-12-15', block: 'Korba', gp_ulb: 'GP2', ward: '14' },
            { name: 'Manoj Pandey', mobile: '7343210987', dob: '1983-12-15', block: 'Rajnandgaon', gp_ulb: 'ULB2', ward: '15' },

            // Dec 15 (Anniversaries)
            { name: 'Rekha Sharma', mobile: '6343209876', whatsapp: '6343209876', anniversary: '2018-12-15', dob: '1988-01-25', block: 'Raipur', gp_ulb: 'GP1', ward: '16' },

            // Dec 16 (Birthdays)
            { name: 'Sanjay Verma', mobile: '9243208765', dob: '1979-12-16', block: 'Bilaspur', gp_ulb: 'GP2', ward: '17' },
            { name: 'Geeta Patel', mobile: '8243207654', whatsapp: '8243207654', dob: '1996-12-16', block: 'Durg', gp_ulb: 'ULB1', ward: '18' },

            // Dec 16 (Anniversaries)
            { name: 'Ashok Singh', mobile: '7243206543', anniversary: '2000-12-16', dob: '1970-06-30', block: 'Korba', gp_ulb: 'GP1', ward: '19' },
            { name: 'Shobha Kumar', mobile: '6243205432', whatsapp: '6243205432', anniversary: '2020-12-16', block: 'Rajnandgaon', gp_ulb: 'GP2', ward: '20' },
        ];

        const results: { id: string; name: string }[] = [];
        const errors: { name: string; error: string }[] = [];

        for (const person of decemberData) {
            const dobDate = person.dob ? new Date(person.dob) : null;
            const annDate = person.anniversary ? new Date(person.anniversary) : null;

            const fields: Record<string, any> = {
                full_name: toFirestoreString(person.name),
                name: toFirestoreString(person.name),
                phone: toFirestoreString(person.mobile),
                mobile_number: toFirestoreString(person.mobile),
                block: toFirestoreString(person.block),
                gp_ulb: toFirestoreString(person.gp_ulb),
                ward: toFirestoreString(person.ward),
                tags: toFirestoreArray(['seeded', 'dec-test']),
                created_at: toFirestoreTimestamp(new Date()),
                updated_at: toFirestoreTimestamp(new Date()),
            };

            if (person.whatsapp) {
                fields.whatsapp = toFirestoreString(person.whatsapp);
            }

            if (dobDate) {
                fields.birthday = toFirestoreTimestamp(dobDate);
                fields.dob = toFirestoreString(person.dob!);
                fields.dob_month = { integerValue: String(dobDate.getMonth() + 1) };
                fields.dob_day = { integerValue: String(dobDate.getDate()) };
                fields.birthday_mmdd = toFirestoreString(formatDateMMDD(dobDate));
            }

            if (annDate) {
                fields.anniversary = toFirestoreTimestamp(annDate);
                fields.anniversary_month = { integerValue: String(annDate.getMonth() + 1) };
                fields.anniversary_day = { integerValue: String(annDate.getDate()) };
                fields.anniversary_mmdd = toFirestoreString(formatDateMMDD(annDate));
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
                console.error(`Firestore error for ${person.name}:`, errorData);
                errors.push({ name: person.name, error: errorData.error?.message || 'Unknown error' });
                continue;
            }

            const data = await response.json();
            const docId = data.name?.split('/').pop();
            results.push({ id: docId, name: person.name });
        }

        return NextResponse.json({
            success: true,
            message: `Created ${results.length} constituents with Dec 12-16 dates (${errors.length} errors)`,
            data: results,
            errors: errors.length > 0 ? errors : undefined,
            distribution: {
                'Dec 12 (Today)': '5 people (3 birthdays, 2 anniversaries)',
                'Dec 13 (Tomorrow)': '5 people (3 birthdays, 2 anniversaries)',
                'Dec 14': '3 people (2 birthdays, 1 anniversary)',
                'Dec 15': '3 people (2 birthdays, 1 anniversary)',
                'Dec 16': '4 people (2 birthdays, 2 anniversaries)',
            }
        });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
