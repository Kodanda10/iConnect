# PII Classification & Data Protection Guide

> **Version**: 1.0.0  
> **Last Updated**: 2025-12-17

---

## PII Classification

### Sensitive PII (High Protection)

| Field | Collection | Risk | Retention |
|-------|------------|------|-----------|
| `mobile_number` | `constituents` | High | 7 years |
| `dob` | `constituents` | Medium | 7 years |
| `anniversary` | `constituents` | Medium | 7 years |
| `address` | `constituents` | High | 7 years |
| `fcmToken` | `users` | Medium | Until logout |
| `message_preview` | `action_logs` | Medium | 90 days |

### Non-Sensitive Data

| Field | Collection | Retention |
|-------|------------|-----------|
| `name` | `constituents` | 7 years |
| `ward_number` | `constituents` | Indefinite |
| `block`, `gp_ulb` | `constituents` | Indefinite |
| `type`, `status` | `tasks` | 2 years |
| `role` | `users` | Account lifetime |

---

## Data Retention Policies

### Automatic Deletion

#### Action Logs (90 Days)

```typescript
// functions/src/cleanup.ts
export const cleanupActionLogs = onSchedule({
  schedule: '0 2 * * 0', // Weekly on Sunday 2 AM
  region: 'asia-south1',
}, async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  
  const logsRef = admin.firestore().collection('action_logs');
  const snapshot = await logsRef
    .where('executed_at', '<', Timestamp.fromDate(cutoff))
    .limit(500)
    .get();
  
  const batch = admin.firestore().batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  console.log(`Deleted ${snapshot.size} action logs`);
});
```

#### Completed Tasks (2 Years)

```typescript
export const cleanupCompletedTasks = onSchedule({
  schedule: '0 3 1 * *', // Monthly on 1st, 3 AM
  region: 'asia-south1',
}, async () => {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 2);
  
  const tasksRef = admin.firestore().collection('tasks');
  const snapshot = await tasksRef
    .where('status', '==', 'COMPLETED')
    .where('createdAt', '<', Timestamp.fromDate(cutoff))
    .limit(500)
    .get();
  
  const batch = admin.firestore().batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  console.log(`Deleted ${snapshot.size} completed tasks`);
});
```

---

## Data Access Controls

### Firestore Rules (Privacy)

```javascript
// firebase/firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Constituents: Mask PII in queries
    match /constituents/{id} {
      allow read: if isStaffOrLeader();
      allow create, update: if isStaff() && 
        // Validate PII fields are present
        request.resource.data.keys().hasAll(['name', 'mobile_number']);
      allow delete: if isStaff();
    }
    
    // Action Logs: Only leaders see their own
    match /action_logs/{id} {
      allow read: if isStaff() || 
        (isLeader() && resource.data.executed_by == request.auth.uid);
      allow create: if isLeader();
    }
  }
}
```

---

## Anonymization for Staging

### Script: `scripts/anonymize-firestore.ts`

```typescript
import * as admin from 'firebase-admin';
import { createHash } from 'crypto';

admin.initializeApp();
const db = admin.firestore();

async function anonymizeConstituents() {
  const constituentsRef = db.collection('constituents');
  const snapshot = await constituentsRef.get();
  
  const batch = db.batch();
  let count = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Hash mobile number
    const hash = createHash('sha256')
      .update(data.mobile_number)
      .digest('hex')
      .substring(0, 10);
    
    const anonymized = {
      ...data,
      name: `User_${hash}`,
      mobile_number: `+91${hash}`,
      address: `${data.block}, ${data.gp_ulb}`, // Keep geography only
      dob: data.dob ? anonymizeDate(data.dob) : null,
      anniversary: data.anniversary ? anonymizeDate(data.anniversary) : null,
    };
    
    batch.update(doc.ref, anonymized);
    count++;
    
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Anonymized ${count} constituents`);
    }
  }
  
  await batch.commit();
  console.log(`Total anonymized: ${count}`);
}

function anonymizeDate(date: string): string {
  // Keep month/day, randomize year
  const [year, month, day] = date.split('-');
  const randomYear = 1950 + Math.floor(Math.random() * 50);
  return `${randomYear}-${month}-${day}`;
}

anonymize Constituents();
```

---

## User Data Export (GDPR-like)

### Export User Data Callable Function

```typescript
export const exportUserData = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be logged in');
    
    const uid = request.auth.uid;
    const data: any = {};
    
    // User profile
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    data.profile = userDoc.data();
    
    // Action logs
    const logsSnapshot = await admin.firestore()
      .collection('action_logs')
      .where('executed_by', '==', uid)
      .get();
    data.action_logs = logsSnapshot.docs.map(d => d.data());
    
    return { data, timestamp: new Date().toISOString() };
  }
);
```

---

## Data Deletion Request

### Delete User Data Callable Function

```typescript
export const deleteUserData = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be logged in');
    
    const uid = request.auth.uid;
    const batch = admin.firestore().batch();
    
    // Delete user profile
    const userRef = admin.firestore().collection('users').doc(uid);
    batch.delete(userRef);
    
    // Delete action logs
    const logsSnapshot = await admin.firestore()
      .collection('action_logs')
      .where('executed_by', '==', uid)
      .get();
    
    logsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    await batch.commit();
    
    // Delete Firebase Auth user
    await admin.auth().deleteUser(uid);
    
    return { success: true, deletedAt: new Date().toISOString() };
  }
);
```

---

## Encryption at Rest

### Firestore
- **Automatic**: All data encrypted at rest by default (AES-256)
- **No action required**

### Cloud Functions Secrets
- **Secret Manager**: Encrypted by default
- **Rotation**: Annual key rotation recommended

---

## Compliance Checklist

- [ ] PII fields classified and documented
- [ ] Retention policies defined per collection
- [ ] Automated cleanup functions deployed
- [ ] Firestore rules enforce access controls
- [ ] Anonymization script for staging data
- [ ] User data export function implemented
- [ ] User data deletion function implemented
- [ ] Encryption verified (at rest + in transit)
- [ ] Data processing agreements signed (if applicable)

---

## Audit Trail

### Enable Firestore Audit Logs

```bash
# Via GCP Console
# IAM & Admin → Audit Logs → Cloud Firestore API
# Enable: Admin Read, Data Read, Data Write

# Via CLI
gcloud logging sinks create firestore-audit \
  storage.googleapis.com/iconnect-audit-logs \
  --log-filter='resource.type="cloud_firestore_database"'
```

### Query Audit Logs

```bash
# Who accessed what PII
gcloud logging read \
  'resource.type="cloud_firestore_database" AND protoPayload.methodName="google.firestore.v1.Firestore.GetDocument"' \
  --limit=50 \
  --format=json
```

---

## Incident Response

### Data Breach Protocol

1. **Immediate**: Revoke compromised credentials
2. **Investigate**: Check audit logs for unauthorized access
3. **Notify**: Inform affected users within 72 hours
4. **Remediate**: Patch vulnerability, rotate secrets
5. **Document**: Post-mortem report
