const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'iconnect-crm'
});

const db = admin.firestore();

// 75 Unique Odia names
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

const testPhones = ['6370502503', '9695528000', '7093322157'];
const gps = ['Jaraka', 'Jenapur', 'Kotapur', 'Aruha', 'Chahata', 'Deoka', 'Badagaon', 'Nuagaon'];
const uid = '1hLlstCQOjOPdIOg7MT32Wbaiq22';

function getRandomPhone() {
    return testPhones[Math.floor(Math.random() * testPhones.length)];
}

async function seedConstituents() {
    console.log('Seeding constituents for Staff Portal (Dec 16-30 birthdays)...');

    const batch = db.batch();
    let count = 0;

    // Seed 75 constituents with birthdays spread across Dec 16-30
    for (let i = 0; i < uniqueNames.length; i++) {
        const name = uniqueNames[i];
        const day = 16 + (i % 15); // Dec 16-30
        const mmdd = `12-${String(day).padStart(2, '0')}`; // e.g. "12-25"

        const docRef = db.collection('constituents').doc(`constituent_${i}`);

        batch.set(docRef, {
            name: name,
            full_name: name,
            mobile_number: getRandomPhone(),
            phone: getRandomPhone(),
            ward: String((i % 10) + 1).padStart(2, '0'),
            ward_number: String((i % 10) + 1),
            block: 'Dharmasala',
            gp_ulb: gps[i % gps.length],
            dob: `1980-12-${String(day).padStart(2, '0')}`,
            dob_month: 12,
            dob_day: day,
            birthday_mmdd: mmdd,
            // Add some anniversaries too
            anniversary: i % 3 === 0 ? `2010-12-${String(day).padStart(2, '0')}` : null,
            anniversary_month: i % 3 === 0 ? 12 : null,
            anniversary_day: i % 3 === 0 ? day : null,
            anniversary_mmdd: i % 3 === 0 ? mmdd : null,
            created_at: new Date().toISOString(),
            uid: uid,
        });

        console.log(`Added: ${name} (birthday: ${mmdd})`);
        count++;
    }

    await batch.commit();
    console.log(`✅ Seeded ${count} constituents for Staff Portal`);
}

seedConstituents()
    .then(() => { console.log('Done!'); process.exit(0); })
    .catch(e => { console.error('Error:', e.message); process.exit(1); });
