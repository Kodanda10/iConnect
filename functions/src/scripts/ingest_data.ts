
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(), // Uses GOOGLE_APPLICATION_CREDENTIALS or default gcloud auth
        projectId: 'iconnect-crm',
    });
}

const db = admin.firestore();

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

async function clearCollections() {
    console.log('Clearing existing data...');
    const collections = ['constituents', 'tasks', 'action_logs', 'day_summaries'];

    for (const colName of collections) {
        const snapshot = await db.collection(colName).get();
        if (snapshot.size === 0) continue;

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`Cleared ${snapshot.size} docs from ${colName}`);
    }
}

function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/');
    // Note: Creating date in UTC or local? 
    // Creating at 12:00 PM to avoid TZ shifts across midnight
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
}

// Function to check if a date (DD/MM/YYYY) is "Today"(18th Dec) or "Tomorrow"(19th Dec)
// The user gave data for 18/12 and 19/12.
// We assume "Today" is 18/12/2025 based on system time instructions.
function getTaskDateForCurrentYear(dateStr: string): Date {
    const [day, month] = dateStr.split('/');
    // Create date for 2025 (Current system year is 2025)
    return new Date(2025, parseInt(month) - 1, parseInt(day), 12, 0, 0);
}

async function ingestData() {
    await clearCollections();

    const lines = DATA.split('\n').slice(1); // Skip header
    const batch = db.batch();

    let constituentCount = 0;
    let taskCount = 0;

    for (const line of lines) {
        if (!line.trim()) continue;

        const [name, mobile, ward, block, gp, birthday, anniversary] = line.split(',').map(s => s.trim());

        // 1. Create Constituent
        const constituentRef = db.collection('constituents').doc();
        const constituentId = constituentRef.id;

        // Convert dates to YYYY-MM-DD for constituent record
        const dobDate = parseDate(birthday);
        const dobStr = `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`;

        let anniversaryStr = '';
        if (anniversary) {
            const annDate = parseDate(anniversary);
            anniversaryStr = `${annDate.getFullYear()}-${String(annDate.getMonth() + 1).padStart(2, '0')}-${String(annDate.getDate()).padStart(2, '0')}`;
        }

        batch.set(constituentRef, {
            name,
            mobile,
            ward: parseInt(ward),
            block,
            gram_panchayat: gp,
            dob: dobStr,
            anniversary: anniversaryStr,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        constituentCount++;

        // 2. Create Tasks (Birthday & Anniversary) for THIS YEAR (2025)
        // This ensures they show up in "Today" (18/12) or "Tomorrow" (19/12) logic

        // Birthday Task
        const bdayTaskRef = db.collection('tasks').doc();
        const bdayDueDate = getTaskDateForCurrentYear(birthday);

        batch.set(bdayTaskRef, {
            constituent_id: constituentId,
            uid: '1hLlstCQOjOPdIOg7MT32Wbaiq22', // HARDCODED for Testing
            type: 'BIRTHDAY',
            status: 'PENDING',
            due_date: admin.firestore.Timestamp.fromDate(bdayDueDate),
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            call_sent: false,
            sms_sent: false,
            whatsapp_sent: false,
            // Denormalized data
            constituent_name: name,
            constituent_mobile: mobile,
            ward_number: parseInt(ward),
            block: block,
            gram_panchayat: gp
        });
        taskCount++;

        // Anniversary Task
        if (anniversary) {
            const annTaskRef = db.collection('tasks').doc();
            const annDueDate = getTaskDateForCurrentYear(anniversary);

            batch.set(annTaskRef, {
                constituent_id: constituentId,
                uid: '1hLlstCQOjOPdIOg7MT32Wbaiq22', // HARDCODED
                type: 'ANNIVERSARY',
                status: 'PENDING',
                due_date: admin.firestore.Timestamp.fromDate(annDueDate),
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                call_sent: false,
                sms_sent: false,
                whatsapp_sent: false,
                // Denormalized data
                constituent_name: name,
                constituent_mobile: mobile,
                ward_number: parseInt(ward),
                block: block,
                gram_panchayat: gp
            });
            taskCount++;
        }
    }

    await batch.commit();
    console.log(`Ingested ${constituentCount} constituents and ${taskCount} tasks.`);
}

ingestData().catch(console.error);
