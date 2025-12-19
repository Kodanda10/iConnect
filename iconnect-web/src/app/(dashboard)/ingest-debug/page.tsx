'use client';

import { useState } from 'react';
import { getFirebaseDb } from '@/lib/firebase';
import { collection, writeBatch, doc, Timestamp, getDocs } from 'firebase/firestore';

const DATA = `
NAME,MOBILE,WARD,BLOCK,GP/ULB,BIRTHDAY,ANNIVERSARY
Abhijeet Mohanty,6370502503,04,Dharmasala,Jaraka,18/12/1990,18/12/2018
Nitin Sahoo,9685528000,12,Dharmasala,Chahata,18/12/1985,
Priyadarshini Jena,8249999899,07,Rasulpur,Aruha,18/12/1992,19/12/2020
Rakesh Kumar Das,7093322157,02,Dharmasala,Kotapur,18/12/1988,18/12/2015
Sasmita Patra,6370502503,15,Rasulpur,Deoda,19/12/1995,
Biswajit Nayak,9685528000,09,Dharmasala,Jaraka,19/12/1982,19/12/2010
Manas Ranjan Behera,8249999899,05,Dharmasala,Aruha,19/12/1990,
Subhashree Mishra,7093322157,11,Rasulpur,Chahata,18/12/1993,18/12/2019
Tapan Kumar Sethy,6370502503,03,Dharmasala,Deoda,18/12/1975,
Alok Kumar Rout,9685528000,14,Rasulpur,Kotapur,19/12/1980,19/12/2005
Debasis Panigrahi,8249999899,01,Dharmasala,Jaraka,19/12/1998,
Lopamudra Swain,7093322157,08,Dharmasala,Chahata,18/12/1987,18/12/2012
Sanjib Kumar Mallick,6370502503,06,Rasulpur,Aruha,18/12/1991,
Rashmi Rekha Das,9685528000,10,Dharmasala,Kotapur,19/12/1994,19/12/2021
Chinmayee Bhuyan,8249999899,18,Rasulpur,Deoda,19/12/1989,
Soumya Ranjan Panda,7093322157,19,Dharmasala,Jaraka,18/12/1986,18/12/2014
Deepak Kumar Barik,6370502503,04,Dharmasala,Aruha,18/12/1996,
Ankita Priyadarshini,9685528000,12,Rasulpur,Chahata,19/12/1992,19/12/2018
Prasant Kumar Lenka,8249999899,05,Dharmasala,Deoda,19/12/1978,
Sidharth Shankar Ray,7093322157,02,Rasulpur,Kotapur,18/12/1984,18/12/2011
Gitanjali Mahapatra,6370502503,11,Dharmasala,Jaraka,18/12/1995,
Manoj Kumar Bhoi,9685528000,13,Dharmasala,Chahata,19/12/1990,19/12/2016
Sujata Tripathy,8249999899,09,Rasulpur,Aruha,19/12/1983,
Bikash Chandra Das,7093322157,07,Dharmasala,Kotapur,18/12/1997,
Pallavi Samal,6370502503,16,Rasulpur,Deoda,18/12/1991,18/12/2020
Ashish Kumar Pradhan,9685528000,03,Dharmasala,Jaraka,19/12/1988,
Smita Rani Jena,8249999899,14,Dharmasala,Aruha,19/12/1993,19/12/2019
Rajesh Kumar Sahoo,7093322157,01,Rasulpur,Chahata,18/12/1981,
Sunita Kumari Kar,6370502503,08,Dharmasala,Deoda,18/12/1986,18/12/2013
Pravat Kumar Biswal,9685528000,06,Rasulpur,Kotapur,19/12/1979,
Jyotirmayee Das,8249999899,10,Dharmasala,Jaraka,19/12/1994,19/12/2022
Himanshu Sekhar Bala,7093322157,15,Dharmasala,Chahata,18/12/1990,
Archana Nayak,6370502503,02,Rasulpur,Aruha,18/12/1992,
Sandeep Kumar Mohanty,9685528000,17,Dharmasala,Kotapur,19/12/1985,19/12/2015
Madhusmita Behera,8249999899,05,Rasulpur,Deoda,19/12/1996,
`.trim();

function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
}

function getTaskDateForCurrentYear(dateStr: string): Date {
    const [day, month] = dateStr.split('/');
    return new Date(2025, parseInt(month) - 1, parseInt(day), 12, 0, 0);
}

export default function IngestPage() {
    const [status, setStatus] = useState<string>('Ready');
    const [loading, setLoading] = useState(false);

    const clearCollection = async (collectionName: string) => {
        const db = getFirebaseDb();
        const snapshot = await getDocs(collection(db, collectionName));
        if (snapshot.empty) return;

        setStatus(`Clearing ${collectionName} (${snapshot.size} docs)...`);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    };

    const handleIngest = async () => {
        setLoading(true);
        setStatus('Starting ingestion...');
        const db = getFirebaseDb();

        try {
            // 1. Clear old data
            await clearCollection('constituents');
            await clearCollection('tasks');
            await clearCollection('action_logs');
            await clearCollection('day_summaries');

            setStatus('Data cleared. Writing new records...');

            const lines = DATA.split('\n').slice(1);
            const batch = writeBatch(db);
            let checkCount = 0;

            for (const line of lines) {
                if (!line.trim()) continue;

                const [name, mobile, ward, block, gp, birthday, anniversary] = line.split(',').map(s => s.trim());

                // Create Constituent
                const constituentRef = doc(collection(db, 'constituents'));

                const dobDate = parseDate(birthday);
                const dobStr = `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`;

                let anniversaryStr = '';
                if (anniversary) {
                    const annDate = parseDate(anniversary);
                    anniversaryStr = `${annDate.getFullYear()}-${String(annDate.getMonth() + 1).padStart(2, '0')}-${String(annDate.getDate()).padStart(2, '0')}`;
                }

                batch.set(constituentRef, {
                    name,
                    mobile_number: mobile, // Mapped to correct field
                    ward_number: parseInt(ward),
                    block,
                    gram_panchayat: gp,
                    dob: dobStr,
                    anniversary: anniversaryStr,
                    created_at: new Date().toISOString(), // Web app uses ISO string usually, but let's check model
                    updated_at: new Date().toISOString(),
                    dob_month: dobDate.getMonth() + 1,
                    dob_day: dobDate.getDate(),
                    // Flattened fields for easy query
                    search_keywords: [name.toLowerCase(), mobile],
                });

                // Create Birthday Task
                if (birthday) {
                    const taskRef = doc(collection(db, 'tasks'));
                    const bdayDueDate = getTaskDateForCurrentYear(birthday);

                    batch.set(taskRef, {
                        constituent_id: constituentRef.id,
                        uid: '1hLlstCQOjOPdIOg7MT32Wbaiq22',
                        type: 'BIRTHDAY',
                        status: 'PENDING',
                        due_date: Timestamp.fromDate(bdayDueDate),
                        created_at: Timestamp.now(),
                        call_sent: false,
                        sms_sent: false,
                        whatsapp_sent: false,
                        constituent_name: name,
                        constituent_mobile: mobile,
                        ward_number: parseInt(ward),
                        block: block,
                        gram_panchayat: gp
                    });
                }

                // Create Anniversary Task
                if (anniversary) {
                    const taskRef = doc(collection(db, 'tasks'));
                    const annDueDate = getTaskDateForCurrentYear(anniversary);

                    batch.set(taskRef, {
                        constituent_id: constituentRef.id,
                        uid: '1hLlstCQOjOPdIOg7MT32Wbaiq22',
                        type: 'ANNIVERSARY',
                        status: 'PENDING',
                        due_date: Timestamp.fromDate(annDueDate),
                        created_at: Timestamp.now(),
                        call_sent: false,
                        sms_sent: false,
                        whatsapp_sent: false,
                        constituent_name: name,
                        constituent_mobile: mobile,
                        ward_number: parseInt(ward),
                        block: block,
                        gram_panchayat: gp
                    });
                }

                checkCount++;
            }

            await batch.commit();
            setStatus(`SUCCESS! Ingested ${checkCount} constituents + tasks. Please check app.`);

        } catch (e) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            setStatus(`ERROR: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Data Ingestion Debugger</h1>
            <div className="bg-gray-900 p-4 rounded text-white font-mono mb-4">
                Status: {status}
            </div>
            <button
                onClick={handleIngest}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded"
            >
                {loading ? 'Processing...' : 'WIPE & INGEST TEST DATA'}
            </button>
        </div>
    );
}
