const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'iconnect-crm'
});

const db = admin.firestore();

// 75 Unique Odia names (no duplicates)
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

// 3 test phone numbers for random assignment
const testPhones = ['6370502503', '9695528000', '7093322157'];

const gps = ['Jaraka', 'Jenapur', 'Kotapur', 'Aruha', 'Chahata', 'Deoka', 'Badagaon', 'Nuagaon'];
const types = ['BIRTHDAY', 'ANNIVERSARY'];
const uid = '1hLlstCQOjOPdIOg7MT32Wbaiq22';

function getRandomPhone() {
    return testPhones[Math.floor(Math.random() * testPhones.length)];
}

async function clearOldTasks() {
    console.log('Clearing old task documents...');
    const snapshot = await db.collection('tasks').where('uid', '==', uid).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    if (snapshot.docs.length > 0) {
        await batch.commit();
        console.log(`Deleted ${snapshot.docs.length} old tasks`);
    }
}

async function seedData() {
    await clearOldTasks();

    console.log('Seeding unique Odia names data for Dec 16-30, 2025...');

    const batch = db.batch();
    let nameIndex = 0;

    // Seed for Dec 16-30, 2025 (5 unique names per day, 15 days = 75 tasks)
    for (let day = 16; day <= 30; day++) {
        const dueDate = new Date(2025, 11, day); // December 2025
        dueDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 5; i++) {
            if (nameIndex >= uniqueNames.length) break;

            const name = uniqueNames[nameIndex];
            const taskId = `task_${nameIndex}`;
            const taskRef = db.collection('tasks').doc(taskId);

            const isPast = day < 25; // Dec 25 is current day

            batch.set(taskRef, {
                name: name,
                constituent_name: name,
                constituentId: `const_${nameIndex}`,
                ward: String((i + 1) * 2).padStart(2, '0'),
                type: types[i % 2],
                due_date: admin.firestore.Timestamp.fromDate(dueDate),
                status: isPast && i < 3 ? 'COMPLETED' : 'PENDING',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                mobile: getRandomPhone(), // Random from 3 test numbers
                block: 'Dharmasala',
                gram_panchayat: gps[i % gps.length],
                uid: uid,
                call_sent: isPast && i < 3,
                sms_sent: isPast && i < 2,
                whatsapp_sent: isPast && i < 1,
            });
            console.log(`Dec ${day}: ${name} -> ${taskRef.id}`);
            nameIndex++;
        }
    }

    // Add conference call
    const tickerRef = db.collection('active_tickers').doc(uid);
    batch.set(tickerRef, {
        title: 'Shri Pranab Balabantaray - Dharmasala Block-Level Review Meeting',
        startTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)),
        meetUrl: 'https://meet.google.com/abc-defg-hij',
        status: 'scheduled',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
    console.log(`✅ Seeded ${nameIndex} unique tasks + 1 conference call`);
}

seedData()
    .then(() => { console.log('Done!'); process.exit(0); })
    .catch(e => { console.error('Error:', e.message); process.exit(1); });
