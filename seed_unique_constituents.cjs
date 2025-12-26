/**
 * @file seed_unique_constituents.cjs
 * @description Seeds 100+ unique constituents with Odia names
 * @changelog
 * - 2024-12-25: Initial implementation - unique names, single event per person
 */

const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'iconnect-crm'
});

const db = admin.firestore();
const uid = '1hLlstCQOjOPdIOg7MT32Wbaiq22';

// 120 Unique Odia Names (no duplicates)
const odiaNames = [
    // Male Names (60)
    'Abhijeet Mohapatra', 'Achyutananda Panda', 'Ajay Kumar Sahoo', 'Akshay Rout', 'Amiya Ranjan Das',
    'Anil Kumar Behera', 'Arun Kumar Nayak', 'Ashok Kumar Swain', 'Baikuntha Nath Jena', 'Basanta Kumar Mishra',
    'Bhagirathi Sahu', 'Bharat Bhushan Mohanty', 'Bidyadhar Patra', 'Bipin Bihari Rath', 'Bishnu Charan Parida',
    'Braja Kishore Dash', 'Chakradhar Tripathy', 'Chandra Sekhar Behera', 'Chitta Ranjan Pradhan', 'Damodar Senapati',
    'Debashish Mahapatra', 'Deepak Kumar Lenka', 'Dhirendra Nath Biswal', 'Dilip Kumar Samal', 'Durga Prasad Pattnaik',
    'Gajanan Barik', 'Gangadhar Meher', 'Ghanashyam Routray', 'Gokul Chandra Nanda', 'Gopabandhu Khuntia',
    'Hari Shankar Satpathy', 'Hemant Kumar Muduli', 'Jagabandhu Palai', 'Jagannath Kar', 'Jitendra Kumar Mallick',
    'Kailash Chandra Naik', 'Keshab Chandra Chand', 'Krushna Chandra Dhir', 'Laxmidhar Moharana', 'Lokanath Misra',
    'Madan Mohan Panda', 'Manoj Kumar Sahoo', 'Narayan Chandra Das', 'Nilamani Sethi', 'Niranjan Rout',
    'Padmanabh Jena', 'Prafulla Kumar Behera', 'Prashant Mohapatra', 'Priyaranjan Sahu', 'Rabindra Nath Mishra',
    'Rabi Narayan Parida', 'Raghunath Patra', 'Rajendra Prasad Nayak', 'Ramakrushna Panda', 'Ranjan Kumar Samal',
    'Saroj Kumar Tripathy', 'Sashi Bhushan Rath', 'Shyam Sundar Dash', 'Sudhir Kumar Swain', 'Surendra Nath Senapati',

    // Female Names (60)
    'Annapurna Devi', 'Arundhati Mishra', 'Basanti Behera', 'Bharati Sahoo', 'Bidyulata Panda',
    'Bijayalaxmi Nayak', 'Chandrakanti Jena', 'Damayanti Rout', 'Draupadi Mohapatra', 'Gita Rani Das',
    'Haimabati Samal', 'Janaki Devi Tripathy', 'Jayanti Patra', 'Kalpana Sahu', 'Kamala Kanta Parida',
    'Kanaklata Behera', 'Kuntala Mohanty', 'Lalita Biswal', 'Lilavati Senapati', 'Mamata Routray',
    'Manjulata Lenka', 'Minati Mahapatra', 'Nalini Pattnaik', 'Namita Rath', 'Nirupama Dash',
    'Padmini Barik', 'Parbati Khuntia', 'Pratima Nanda', 'Premila Satpathy', 'Purnima Swain',
    'Radharani Muduli', 'Rajlaxmi Palai', 'Renubala Kar', 'Sakuntala Mallick', 'Santilata Naik',
    'Saraswati Chand', 'Sarojini Dhir', 'Sashikala Moharana', 'Savitri Misra', 'Shantilata Panda',
    'Sita Devi Sahoo', 'Snehalata Das', 'Subhadra Sethi', 'Sukanti Rout', 'Sumitra Jena',
    'Sunita Behera', 'Sushama Mohapatra', 'Sushila Sahu', 'Tapswini Mishra', 'Tulasi Parida',
    'Uma Devi Patra', 'Urmila Nayak', 'Usha Rani Panda', 'Vasanti Samal', 'Vidyullata Tripathy',
    'Yasoda Rath', 'Jamuna Devi Dash', 'Padma Swain', 'Sabita Senapati', 'Kabita Mohapatra'
];

// All 42 Dharmasala Gram Panchayats
const dharmasalaGPs = [
    'Abhayapur', 'Anjira', 'Antia', 'Arabal', 'Areikawa', 'Aruha',
    'Badakaima', 'Badapokhari', 'Baghuapal', 'Balichandrapur', 'Balia', 'Balisahi',
    'Barchhana', 'Bhagbanpur', 'Bhawanipur', 'Brundadeipur', 'Chahata', 'Chakradharpur',
    'Charampa', 'Darpanarayanpur', 'Deoka', 'Dhanurjayapur', 'Garhasahi', 'Gopinathapur',
    'Jaraka', 'Jenapur', 'Kaliapani', 'Kantigadia', 'Kasimpur', 'Kendrapara',
    'Keshpur', 'Kotapur', 'Kuanrpur', 'Machhamaria', 'Madanpur', 'Manikpur',
    'Nuapur', 'Panchupali', 'Ranipada', 'Rasulpur', 'Santarapur', 'Sinduria'
];

// Generate dates from Dec 18, 2024 to Jan 1, 2025 (14 days)
function getDateRange() {
    const dates = [];
    // Dec 18-31
    for (let day = 18; day <= 31; day++) {
        dates.push(new Date(2024, 11, day)); // December 2024
    }
    // Jan 1
    dates.push(new Date(2025, 0, 1)); // January 1, 2025
    return dates;
}

async function wipeDatabase() {
    console.log('Wiping existing data...');

    // Delete all tasks
    const tasksSnapshot = await db.collection('tasks').get();
    const taskBatch = db.batch();
    tasksSnapshot.docs.forEach(doc => taskBatch.delete(doc.ref));
    await taskBatch.commit();
    console.log(`Deleted ${tasksSnapshot.size} tasks`);

    // Delete all constituents
    const constSnapshot = await db.collection('constituents').get();
    const constBatch = db.batch();
    constSnapshot.docs.forEach(doc => constBatch.delete(doc.ref));
    await constBatch.commit();
    console.log(`Deleted ${constSnapshot.size} constituents`);
}

async function seedUniqueConstituents() {
    console.log('='.repeat(60));
    console.log('Seeding 120 Unique Constituents with Odia Names');
    console.log('='.repeat(60));

    await wipeDatabase();

    const dates = getDateRange();
    const today = new Date(2024, 11, 25); // Dec 25, 2024
    today.setHours(0, 0, 0, 0);

    let batch = db.batch();
    let batchCount = 0;

    for (let i = 0; i < odiaNames.length; i++) {
        const name = odiaNames[i];
        const gp = dharmasalaGPs[i % dharmasalaGPs.length];
        const ward = String((i % 20) + 1).padStart(2, '0');
        const mobile = `98${String(70000000 + i).slice(-8)}`;

        // Distribute dates evenly across 15 days
        const dateIndex = i % dates.length;
        const eventDate = dates[dateIndex];

        // Alternate: odd index = BIRTHDAY, even index = ANNIVERSARY
        const eventType = i % 2 === 0 ? 'BIRTHDAY' : 'ANNIVERSARY';

        // Format date as YYYY-MM-DD for storage
        const dateStr = eventDate.toISOString().split('T')[0];

        // Create constituent (either dob OR anniversary, not both)
        const constituentId = `const_${i}`;
        const constituentRef = db.collection('constituents').doc(constituentId);

        const constituentData = {
            name: name,
            full_name: name,
            mobile_number: mobile,
            phone: mobile,
            block: 'Dharmasala',
            gp_ulb: gp,
            gram_panchayat: gp,
            ward_number: ward,
            ward: ward,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Only set the relevant date field (NOT both)
        if (eventType === 'BIRTHDAY') {
            constituentData.dob = dateStr;
        } else {
            constituentData.anniversary = dateStr;
        }

        batch.set(constituentRef, constituentData);

        // Create corresponding task
        const isPast = eventDate < today;
        const isToday = eventDate.getTime() === today.getTime();

        // Random completion status for past dates
        const isCompleted = isPast && (i % 3 === 0);

        const taskId = `task_${eventType.toLowerCase()}_${i}`;
        const taskRef = db.collection('tasks').doc(taskId);

        batch.set(taskRef, {
            constituent_id: constituentId,
            constituentId: constituentId,
            name: name,
            constituent_name: name,
            mobile: mobile,
            constituent_mobile: mobile,
            block: 'Dharmasala',
            gram_panchayat: gp,
            gp_ulb: gp,
            ward: ward,
            ward_number: ward,
            type: eventType,
            due_date: admin.firestore.Timestamp.fromDate(eventDate),
            status: isCompleted ? 'COMPLETED' : 'PENDING',
            uid: uid,
            call_sent: isCompleted,
            sms_sent: isCompleted && i % 2 === 0,
            whatsapp_sent: isCompleted && i % 4 === 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        batchCount += 2;

        // Commit every 400 operations (Firestore limit is 500)
        if (batchCount >= 400) {
            await batch.commit();
            console.log(`Committed batch of ${batchCount} operations`);
            batch = db.batch();
            batchCount = 0;
        }

        console.log(`${i + 1}. ${name} | ${gp} | Ward ${ward} | ${eventType} ${dateStr}`);
    }

    // Add conference call ticker
    const tickerRef = db.collection('active_tickers').doc(uid);
    batch.set(tickerRef, {
        title: 'Shri Pranab Balabantaray - Dharmasala Block-Level Review Meeting',
        startTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)),
        meetUrl: 'https://meet.google.com/abc-defg-hij',
        status: 'scheduled',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Final commit
    if (batchCount > 0) {
        await batch.commit();
        console.log(`Final batch committed (${batchCount} operations)`);
    }

    console.log('='.repeat(60));
    console.log(`✅ Created ${odiaNames.length} unique constituents`);
    console.log(`✅ Created ${odiaNames.length} tasks (each person has ONE event)`);
    console.log(`✅ Conference call ticker added`);
    console.log('='.repeat(60));
}

seedUniqueConstituents()
    .then(() => { console.log('Done!'); process.exit(0); })
    .catch(e => { console.error('Error:', e.message); process.exit(1); });
