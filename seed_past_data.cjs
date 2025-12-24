const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'iconnect-crm'
});

const db = admin.firestore();

const names = [
    'Abhijeet Mohapatra', 'Basanti Devi', 'Chinmay Rath',
    'Debashish Nayak', 'Gyanendra Mishra', 'Harish Panda',
    'Jagdish Dash', 'Kamal Sahu', 'Laxman Patra',
    'Manoj Swain', 'Narayan Das', 'Omkar Mohanty',
    'Prakash Jena', 'Rajesh Kumar', 'Sanjay Tripathy',
    'Tapan Rout', 'Umesh Parida', 'Vinod Nanda',
    'Yashwant Singh', 'Zara Begum'
];

const gps = ['Jaraka', 'Jenapur', 'Kotapur', 'Aruha', 'Chahata', 'Deoka'];
const types = ['BIRTHDAY', 'ANNIVERSARY'];
const uid = '1hLlstCQOjOPdIOg7MT32Wbaiq22';

async function seedPastData() {
    console.log('Adding past 8 days data (Dec 16-23)...');

    const batch = db.batch();

    // Seed for Dec 16-23, 2024 (past 8 days)
    for (let day = 16; day <= 23; day++) {
        const dueDate = new Date(2024, 11, day);
        dueDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 5; i++) {
            const nameIndex = ((day - 16) * 5 + i) % names.length;
            const taskId = `past_${day}_${i}`;
            const taskRef = db.collection('tasks').doc(taskId);

            batch.set(taskRef, {
                name: names[nameIndex],
                constituent_name: names[nameIndex],
                constituentId: `const_${nameIndex}`,
                ward: String((i + 1) * 2).padStart(2, '0'),
                type: types[i % 2],
                due_date: admin.firestore.Timestamp.fromDate(dueDate),
                status: i < 3 ? 'COMPLETED' : 'PENDING', // Mix of completed/pending
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                mobile: `98765432${10 + nameIndex}`,
                block: 'Dharmasala',
                gram_panchayat: gps[i % gps.length],
                uid: uid,
                call_sent: i < 3,
                sms_sent: i < 2,
                whatsapp_sent: i < 1,
            });
            console.log(`Dec ${day}: Added ${names[nameIndex]}`);
        }
    }

    await batch.commit();
    console.log('✅ Added 40 tasks for Dec 16-23 (past 8 days)');
}

seedPastData()
    .then(() => { console.log('Done!'); process.exit(0); })
    .catch(e => { console.error('Error:', e.message); process.exit(1); });
