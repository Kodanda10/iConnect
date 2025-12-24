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

async function seedData() {
  console.log('Starting full seed for Dec 24-30, 2024...');

  const batch = db.batch();

  // Seed 35 tasks for Dec 24-30, 2024 (5 per day)
  for (let day = 24; day <= 30; day++) {
    const dueDate = new Date(2024, 11, day); // December is month 11
    dueDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 5; i++) {
      const nameIndex = ((day - 24) * 5 + i) % names.length;
      const taskId = `dharmasala_${day}_${i}`;
      const taskRef = db.collection('tasks').doc(taskId);

      batch.set(taskRef, {
        name: names[nameIndex],
        constituent_name: names[nameIndex],
        constituentId: `const_${nameIndex}`,
        ward: String((i + 1) * 2).padStart(2, '0'),
        type: types[i % 2],
        due_date: admin.firestore.Timestamp.fromDate(dueDate),
        status: 'PENDING',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        mobile: `98765432${10 + nameIndex}`,
        block: 'Dharmasala',
        gram_panchayat: gps[i % gps.length],
        uid: uid,
        call_sent: false,
        sms_sent: false,
        whatsapp_sent: false,
      });
      console.log(`Day ${day}: Added ${names[nameIndex]}`);
    }
  }

  // Add conference call/meeting ticker
  const tickerRef = db.collection('active_tickers').doc(uid);
  batch.set(tickerRef, {
    title: 'Shri Pranab Balabantaray - Dharmasala Block-Level Review Meeting',
    startTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)), // 30 min from now
    meetUrl: 'https://meet.google.com/abc-defg-hij',
    status: 'scheduled',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('Added conference call ticker');

  await batch.commit();
  console.log('✅ Seeded 35 tasks (Dec 24-30) + 1 conference call');
}

seedData()
  .then(() => { console.log('Done!'); process.exit(0); })
  .catch(e => { console.error('Error:', e.message); process.exit(1); });
