
const admin = require('firebase-admin');

// Force the project ID to ensure no ambiguity
process.env.GCLOUD_PROJECT = 'iconnect-crm';
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: 'iconnect-crm' });

if (!admin.apps.length) {
    admin.initializeApp({
        // Application Default Credentials should pick up the environment
        credential: admin.credential.applicationDefault(),
        projectId: 'iconnect-crm'
    });
}

const db = admin.firestore();

async function debug() {
    console.log('--- DEBUG CONNECTION ---');
    try {
        console.log('Project ID in App:', admin.app().options.projectId);

        // Try to read the constituents collection metadata
        const snapshot = await db.collection('constituents').count().get();
        console.log('SUCCESS: Connected to Firestore!');
        console.log('Constituents Count:', snapshot.data().count);

    } catch (e) {
        console.error('FAILURE: Could not connect.');
        console.error('Error Code:', e.code);
        console.error('Error Message:', e.message);
    }
    console.log('--- END DEBUG ---');
}

debug();
