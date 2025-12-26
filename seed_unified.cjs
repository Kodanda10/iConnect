/**
 * Unified Seed Script for iConnect
 * 
 * Creates BOTH constituents and tasks for unified pipeline
 * 
 * Rules:
 * - NO DATA DELETION (forbidden)
 * - Marks all test data with source: 'TEST_SEED'
 * - Uses 3 specific test phone numbers randomly
 * 
 * Usage: node seed_unified.cjs
 * 
 * @changelog
 * - 2025-12-26: Fixed phone numbers, date range Dec 20 - Jan 5
 */

const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'iconnect-crm'
});

const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;

// --- CORRECT CONFIGURATION ---

// 3 Test phone numbers (use randomly)
const testPhones = ['6370502503', '9695528000', '7093322157'];

// 75 Unique Odia names (from seed_constituents.cjs)
const uniqueNames = [
    'Abhijit Mohanty', 'Ananta Sahoo', 'Banamali Das', 'Biswajit Nayak', 'Chakradhar Panda',
    'Chitta Ranjan Behera', 'Damodar Jena', 'Debasis Mishra', 'Durga Prasad Rath', 'Gajapati Swain',
    'Ganesh Pradhan', 'Gopal Krishna Mohapatra', 'Harihar Patra', 'Hemanta Rout', 'Jadunath Parida',
    'Jagannath Das', 'Jayanta Kumar Sahu', 'Kailash Chandra Tripathy', 'Kamal Lochan Nanda', 'Kishore Kumar Behera',
    'Krushna Chandra Mohanty', 'Laxman Prasad Dash', 'Lingaraj Satpathy', 'Madan Mohan Pattnaik', 'Manoj Kumar Jena',
    'Narayan Chandra Sahoo', 'Narendra Nath Mishra', 'Niranjan Pradhan', 'Omkar Nath Rout', 'Pabitra Kumar Swain',
    'Padma Lochan Das', 'Pramod Kumar Nayak', 'Prasanna Kumar Behera', 'Priyabrata Panda', 'Rabindra Kumar Rath',
    'Radha Krishna Mohanty', 'Rajendra Prasad Sahoo', 'Ramesh Chandra Patra', 'Ranjan Kumar Mishra', 'Ratnakar Tripathy',
    'Sachidananda Nanda', 'Sadananda Mohapatra', 'Santosh Kumar Jena', 'Saroj Kumar Parida', 'Satya Narayan Das',
    'Shanti Ranjan Sahu', 'Sharat Chandra Pradhan', 'Sibaram Swain', 'Somanath Behera', 'Subash Chandra Nayak',
    'Sudhansu Sekhar Panda', 'Sukanta Kumar Mohanty', 'Surendra Nath Rath', 'Susanta Kumar Sahoo', 'Tapan Kumar Patra',
    'Trilochan Das', 'Trinath Mishra', 'Udaya Nath Tripathy', 'Umakanta Nanda', 'Upendra Mohapatra',
    'Vivekananda Jena', 'Yudhisthir Parida', 'Ashok Kumar Pattnaik', 'Bidyadhar Rout', 'Chandramani Swain',
    'Dhirendra Nath Das', 'Fakir Mohan Sahu', 'Gourahari Pradhan', 'Hari Prasad Nayak', 'Iswar Chandra Behera',
    'Jitendra Kumar Panda', 'Kulamani Mohanty', 'Laxmidhar Rath', 'Manoranjan Sahoo', 'Nilamani Patra'
];

const gps = ['Jaraka', 'Jenapur', 'Kotapur', 'Aruha', 'Chahata', 'Deoka', 'Badagaon', 'Nuagaon'];
const uid = '1hLlstCQOjOPdIOg7MT32Wbaiq22';

function getRandomPhone() {
    return testPhones[Math.floor(Math.random() * testPhones.length)];
}

function formatDateStr(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatMMDD(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
}

async function seedUnifiedData() {
    console.log('🚀 seeding unified data (NO DELETION)...\n');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Date range: Dec 20, 2025 → Jan 5, 2026
    const startDate = new Date(2025, 11, 20); // Dec 20, 2025
    const endDate = new Date(2026, 0, 5);     // Jan 5, 2026

    // Generate all dates in range
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    console.log(`📅 Date range: ${formatDateStr(startDate)} → ${formatDateStr(endDate)} (${dates.length} days)\n`);

    let batch = db.batch();
    let operationCount = 0;
    const MAX_BATCH_SIZE = 450;

    let nameIndex = 0;
    let tasksCreated = 0;
    let constituentsCreated = 0;

    for (const date of dates) {
        const mmdd = formatMMDD(date);
        const dateStr = formatDateStr(date);
        const isPast = date < today;

        // Create 3 birthdays per day
        for (let i = 0; i < 3; i++) {
            const name = uniqueNames[nameIndex % uniqueNames.length];
            const phone = getRandomPhone();
            const ward = String((nameIndex % 10) + 1).padStart(2, '0');
            const gp = gps[nameIndex % gps.length];

            const constituentId = `seed_const_${dateStr}_b${i}`;
            const taskId = `seed_task_birthday_${dateStr}_${i}`;

            // --- Create/Update Constituent ---
            const constituentRef = db.collection('constituents').doc(constituentId);
            batch.set(constituentRef, {
                name: name,
                full_name: name,
                mobile_number: phone,
                phone: phone,
                dob: `1985-${mmdd}`,
                birthday_mmdd: mmdd,
                block: 'Dharmasala',
                gp_ulb: gp,
                gram_panchayat: gp,
                ward_number: ward,
                ward: ward,
                created_at: Timestamp.now(),
                uid: uid,
                source: 'TEST_SEED', // Mark as test data
            }, { merge: true });
            operationCount++;
            constituentsCreated++;

            // --- Create Task ---
            const taskRef = db.collection('tasks').doc(taskId);
            batch.set(taskRef, {
                constituent_id: constituentId,
                constituent_name: name,
                constituent_mobile: phone,
                ward_number: ward,
                block: 'Dharmasala',
                gram_panchayat: gp,
                type: 'BIRTHDAY',
                due_date: Timestamp.fromDate(date),
                status: isPast && (i < 2) ? 'COMPLETED' : 'PENDING',
                created_at: Timestamp.now(),
                uid: uid,
                call_sent: isPast && i === 0,
                sms_sent: isPast && i === 0,
                whatsapp_sent: false,
                source: 'TEST_SEED', // Mark as test data
            });
            operationCount++;
            tasksCreated++;

            nameIndex++;

            if (operationCount >= MAX_BATCH_SIZE) {
                console.log(`📤 Committing batch (${operationCount} ops)...`);
                await batch.commit();
                batch = db.batch();
                operationCount = 0;
            }
        }

        // Create 1 anniversary every other day
        if (date.getDate() % 2 === 0) {
            const name = uniqueNames[nameIndex % uniqueNames.length];
            const phone = getRandomPhone();
            const ward = String((nameIndex % 10) + 1).padStart(2, '0');
            const gp = gps[nameIndex % gps.length];

            const constituentId = `seed_const_${dateStr}_ann`;
            const taskId = `seed_task_anniversary_${dateStr}`;

            // Constituent with anniversary
            const constituentRef = db.collection('constituents').doc(constituentId);
            batch.set(constituentRef, {
                name: name,
                full_name: name,
                mobile_number: phone,
                phone: phone,
                dob: '1980-01-15',
                birthday_mmdd: '01-15',
                anniversary: `2010-${mmdd}`,
                anniversary_mmdd: mmdd,
                block: 'Dharmasala',
                gp_ulb: gp,
                gram_panchayat: gp,
                ward_number: ward,
                ward: ward,
                created_at: Timestamp.now(),
                uid: uid,
                source: 'TEST_SEED',
            }, { merge: true });
            operationCount++;
            constituentsCreated++;

            // Anniversary Task
            const taskRef = db.collection('tasks').doc(taskId);
            batch.set(taskRef, {
                constituent_id: constituentId,
                constituent_name: name,
                constituent_mobile: phone,
                ward_number: ward,
                block: 'Dharmasala',
                gram_panchayat: gp,
                type: 'ANNIVERSARY',
                due_date: Timestamp.fromDate(date),
                status: isPast ? 'COMPLETED' : 'PENDING',
                created_at: Timestamp.now(),
                uid: uid,
                call_sent: isPast,
                sms_sent: false,
                whatsapp_sent: false,
                source: 'TEST_SEED',
            });
            operationCount++;
            tasksCreated++;

            nameIndex++;

            if (operationCount >= MAX_BATCH_SIZE) {
                console.log(`📤 Committing batch (${operationCount} ops)...`);
                await batch.commit();
                batch = db.batch();
                operationCount = 0;
            }
        }
    }

    // Commit remaining
    if (operationCount > 0) {
        console.log(`📤 Final batch (${operationCount} ops)...`);
        await batch.commit();
    }

    console.log('\n✅ Unified seeding complete!');
    console.log(`📊 Created ${constituentsCreated} constituents`);
    console.log(`📊 Created ${tasksCreated} tasks`);
    console.log(`📱 Using phones: ${testPhones.join(', ')}`);
    console.log(`🏷️  All marked with source: 'TEST_SEED'`);
}

seedUnifiedData()
    .then(() => {
        console.log('\n🎉 Done!');
        process.exit(0);
    })
    .catch(e => {
        console.error('❌ Error:', e.message);
        process.exit(1);
    });
