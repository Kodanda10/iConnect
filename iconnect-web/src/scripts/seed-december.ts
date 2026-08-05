/**
 * @file seed-december.ts
 * @description Seed script to populate Firestore with constituents having birthdays/anniversaries Dec 12-16
 * Run with: npx ts-node src/scripts/seed-december.ts
 * @changelog
 * - 2024-12-12: Created for testing frontend activity display
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyAygMgePqu-C__yOoqDyqFHgnJ5Snr4Ic8',
    authDomain: 'iconnect-crm.firebaseapp.com',
    projectId: 'iconnect-crm',
    storageBucket: 'iconnect-crm.firebasestorage.app',
    messagingSenderId: '887016822564',
    appId: '1:887016822564:web:dd5f49de3ef0138fe1c5b1',
};

console.log('🔥 Seeding Firebase with Dec 12-16 data for:', firebaseConfig.projectId);

// Comprehensive synthetic data for Dec 12-16
const decemberConstituents = [
    // Dec 12 - TODAY (Birthdays)
    { name: 'Rajesh Sharma', mobile: '9876543210', dob: '1985-12-12', dob_month: 12, dob_day: 12, block: 'Raipur', gp_ulb: 'GP1', ward: '1', whatsapp: '9876543210' },
    { name: 'Priya Verma', mobile: '8765432109', dob: '1990-12-12', dob_month: 12, dob_day: 12, block: 'Bilaspur', gp_ulb: 'GP2', ward: '2', whatsapp: '8765432109' },
    { name: 'Amit Patel', mobile: '7654321098', dob: '1988-12-12', dob_month: 12, dob_day: 12, block: 'Durg', gp_ulb: 'ULB1', ward: '3' },

    // Dec 12 - TODAY (Anniversaries)
    { name: 'Sunita Singh', mobile: '6543210987', anniversary: '2010-12-12', anniversary_month: 12, anniversary_day: 12, block: 'Korba', gp_ulb: 'GP1', ward: '4', dob: '1982-05-20', dob_month: 5, dob_day: 20 },
    { name: 'Vikram Kumar', mobile: '9543210876', anniversary: '2015-12-12', anniversary_month: 12, anniversary_day: 12, block: 'Rajnandgaon', gp_ulb: 'GP2', ward: '5' },

    // Dec 13 - TOMORROW (Birthdays for Heads Up)
    { name: 'Anjali Gupta', mobile: '8543219876', dob: '1995-12-13', dob_month: 12, dob_day: 13, block: 'Raipur', gp_ulb: 'ULB1', ward: '6', whatsapp: '8543219876' },
    { name: 'Suresh Agarwal', mobile: '7543218765', dob: '1980-12-13', dob_month: 12, dob_day: 13, block: 'Bilaspur', gp_ulb: 'GP1', ward: '7' },
    { name: 'Kavita Joshi', mobile: '6543217654', dob: '1992-12-13', dob_month: 12, dob_day: 13, block: 'Durg', gp_ulb: 'GP2', ward: '8', whatsapp: '6543217654' },

    // Dec 13 - TOMORROW (Anniversaries for Heads Up)
    { name: 'Ravi Mishra', mobile: '9443216543', anniversary: '2008-12-13', anniversary_month: 12, anniversary_day: 13, block: 'Korba', gp_ulb: 'ULB2', ward: '9', dob: '1978-03-15', dob_month: 3, dob_day: 15 },
    { name: 'Meena Yadav', mobile: '8443215432', anniversary: '2012-12-13', anniversary_month: 12, anniversary_day: 13, block: 'Rajnandgaon', gp_ulb: 'GP1', ward: '10' },

    // Dec 14 (Birthdays)
    { name: 'Anil Reddy', mobile: '7443214321', dob: '1987-12-14', dob_month: 12, dob_day: 14, block: 'Raipur', gp_ulb: 'GP2', ward: '11', whatsapp: '7443214321' },
    { name: 'Pooja Nair', mobile: '6443213210', dob: '1993-12-14', dob_month: 12, dob_day: 14, block: 'Bilaspur', gp_ulb: 'ULB1', ward: '12' },

    // Dec 14 (Anniversaries)
    { name: 'Deepak Iyer', mobile: '9343212109', anniversary: '2005-12-14', anniversary_month: 12, anniversary_day: 14, block: 'Durg', gp_ulb: 'GP1', ward: '13', dob: '1975-08-10', dob_month: 8, dob_day: 10 },

    // Dec 15 (Birthdays)
    { name: 'Nisha Rao', mobile: '8343211098', dob: '1991-12-15', dob_month: 12, dob_day: 15, block: 'Korba', gp_ulb: 'GP2', ward: '14', whatsapp: '8343211098' },
    { name: 'Manoj Pandey', mobile: '7343210987', dob: '1983-12-15', dob_month: 12, dob_day: 15, block: 'Rajnandgaon', gp_ulb: 'ULB2', ward: '15' },

    // Dec 15 (Anniversaries)
    { name: 'Rekha Sharma', mobile: '6343209876', anniversary: '2018-12-15', anniversary_month: 12, anniversary_day: 15, block: 'Raipur', gp_ulb: 'GP1', ward: '16', dob: '1988-01-25', dob_month: 1, dob_day: 25, whatsapp: '6343209876' },

    // Dec 16 (Birthdays)
    { name: 'Sanjay Verma', mobile: '9243208765', dob: '1979-12-16', dob_month: 12, dob_day: 16, block: 'Bilaspur', gp_ulb: 'GP2', ward: '17' },
    { name: 'Geeta Patel', mobile: '8243207654', dob: '1996-12-16', dob_month: 12, dob_day: 16, block: 'Durg', gp_ulb: 'ULB1', ward: '18', whatsapp: '8243207654' },

    // Dec 16 (Anniversaries)
    { name: 'Ashok Singh', mobile: '7243206543', anniversary: '2000-12-16', anniversary_month: 12, anniversary_day: 16, block: 'Korba', gp_ulb: 'GP1', ward: '19', dob: '1970-06-30', dob_month: 6, dob_day: 30 },
    { name: 'Shobha Kumar', mobile: '6243205432', anniversary: '2020-12-16', anniversary_month: 12, anniversary_day: 16, block: 'Rajnandgaon', gp_ulb: 'GP2', ward: '20', whatsapp: '6243205432' },
];

async function seedDecemberData() {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const constituentsColl = collection(db, 'constituents');

    console.log('📊 Seeding', decemberConstituents.length, 'constituents with Dec 12-16 dates...');

    let count = 0;
    for (const constituent of decemberConstituents) {
        try {
            await addDoc(constituentsColl, {
                ...constituent,
                created_at: new Date().toISOString(),
            });
            count++;
            console.log(`✅ Added: ${constituent.name} (${constituent.dob ? 'DOB: ' + constituent.dob : ''} ${constituent.anniversary ? 'Ann: ' + constituent.anniversary : ''})`);
        } catch (error) {
            console.error(`❌ Failed to add ${constituent.name}:`, error);
        }
    }

    console.log(`\n🎉 Successfully seeded ${count}/${decemberConstituents.length} constituents!`);
    console.log('\n📅 Date distribution:');
    console.log('   Dec 12 (Today): 5 people');
    console.log('   Dec 13 (Tomorrow): 5 people');
    console.log('   Dec 14: 3 people');
    console.log('   Dec 15: 3 people');
    console.log('   Dec 16: 4 people');

    process.exit(0);
}

seedDecemberData().catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
});
