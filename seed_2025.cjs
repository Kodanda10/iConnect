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

async function seedData2025() {
    console.log('Seeding data for Dec 16-30, 2025 (correct year)...');

    const batch = db.batch();

    // Seed for Dec 16-30, 2025
    for (let day = 16; day <= 30; day++) {
        const dueDate = new Date(2025, 11, day); // 2025, December
        dueDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 5; i++) {
            const nameIndex = ((day - 16) * 5 + i) % names.length;
            const taskId = `dec2025_${day}_${i}`;
            const taskRef = db.collection('tasks').doc(taskId);

            const isPast = day < 24;

            batch.set(taskRef, {
                name: names[nameIndex],
                constituent_name: names[nameIndex],
                constituentId: `const_${nameIndex}`,
                ward: String((i + 1) * 2).padStart(2, '0'),
                type: types[i % 2],
                due_date: admin.firestore.Timestamp.fromDate(dueDate),
                status: isPast && i < 3 ? 'COMPLETED' : 'PENDING',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                mobile: `98765432${10 + nameIndex}`,
                block: 'Dharmasala',
                gram_panchayat: gps[i % gps.length],
                uid: uid,
                call_sent: isPast && i < 3,
                sms_sent: isPast && i < 2,
                whatsapp_sent: isPast && i < 1,
            });
            console.log(`Dec ${day}, 2025: Added ${names[nameIndex]}`);
        }
    }

    // Update conference call for today
    const tickerRef = db.collection('active_tickers').doc(uid);
    batch.set(tickerRef, {
        title: 'Shri Pranab Balabantaray - Dharmasala Block-Level Review Meeting',
        startTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)),
        meetUrl: 'https://meet.google.com/abc-defg-hij',
        status: 'scheduled',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
    console.log('✅ Seeded 75 tasks for Dec 16-30, 2025 + conference call');
}

seedData2025()
    .then(() => { console.log('Done!'); process.exit(0); })
    .catch(e => { console.error('Error:', e.message); process.exit(1); });
