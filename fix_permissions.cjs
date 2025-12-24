const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'iconnect-crm'
});

const db = admin.firestore();
const uid = '1hLlstCQOjOPdIOg7MT32Wbaiq22';

async function fixPermissions() {
    console.log('Creating user document with LEADER role...');

    // Create user document with LEADER role
    await db.collection('users').doc(uid).set({
        email: 'admin@admin.com',
        role: 'LEADER',
        displayName: 'Pranab Kumar Balabantaray',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Created user document with LEADER role');

    // Also recreate settings
    await db.collection('settings').doc('app_config').set({
        appName: 'iConnect',
        leaderName: 'Pranab Balabantaray',
        leaderPhoto: 'https://pranabbalabantaray.com/img/pranabbalabantray.jpg',
        block: 'Dharmasala',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Created app_config settings');
}

fixPermissions()
    .then(() => { console.log('Done!'); process.exit(0); })
    .catch(e => { console.error('Error:', e.message); process.exit(1); });
