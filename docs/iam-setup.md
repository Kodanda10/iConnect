# Firebase/GCP IAM Configuration Guide

> **Version**: 1.0.0  
> **Last Updated**: 2025-12-17

---

## Overview

This guide documents the least-privilege IAM configuration for iConnect's Firebase/GCP infrastructure.

---

## Service Accounts

### 1. CI/CD Service Account

**Purpose**: GitHub Actions deployment

```bash
# Create service account
gcloud iam service-accounts create iconnect-ci \
  --display-name="iConnect CI/CD" \
  --project=iconnect-prod

# Grant minimum permissions
gcloud projects add-iam-policy-binding iconnect-prod \
  --member="serviceAccount:iconnect-ci@iconnect-prod.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"

# Generate key
gcloud iam service-accounts keys create ci-key.json \
  --iam-account=iconnect-ci@iconnect-prod.iam.gserviceaccount.com
```

**Permissions Required:**
- `firebase.admin` (deploy functions, rules)
- `cloudscheduler.admin` (manage cron jobs)
- `iam.serviceAccountUser` (impersonate for deployments)

**Store Key in GitHub Secrets:**
```
FIREBASE_SERVICE_ACCOUNT = <contents of ci-key.json>
```

---

### 2. Cloud Functions Service Account

**Purpose**: Runtime execution for Functions

```bash
# Default service account is created automatically
# PROJECT_ID@appspot.gserviceaccount.com

# Review and restrict permissions
gcloud projects get-iam-policy iconnect-prod \
  --flatten="bindings[].members" \
  --filter="bindings.members:iconnect-prod@appspot.gserviceaccount.com"
```

**Required Permissions:**
- `datastore.user` (Firestore read/write)
- `logging.logWriter` (write logs)
- `secretmanager.secretAccessor` (access secrets)

---

### 3. Web Portal Service Account (Vercel)

**Purpose**: Server-side Firebase Admin SDK operations

```bash
# Create for Next.js server actions
gcloud iam service-accounts create iconnect-web \
  --display-name="iConnect Web Portal" \
  --project=iconnect-prod

# Grant Firestore access only
gcloud projects add-iam-policy-binding iconnect-prod \
  --member="serviceAccount:iconnect-web@iconnect-prod.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

---

## User Roles (Firebase Console)

### Staff Role
- **Products**: Authentication, Firestore
- **Permissions**:
  - View/add users
  - Read/write constituents collection
  - Full CRUD on tasks collection
  - Modify settings

### Leader Role
- **Products**: Authentication, Firestore (limited)
- **Permissions**:
  - View own user profile
  - Read constituents, tasks
  - Update task status/notes/actions
  - Call Cloud Functions

---

## Project-Level IAM

### Owner (Minimize)
- **Who**: 1-2 admin accounts only
- **Use**: Initial setup, critical changes

### Editor (Avoid)
- **Who**: None
- **Justification**: Too broad, use custom roles

### Viewer
- **Who**: Monitoring/SRE team
- **Permissions**: Read-only access for debugging

---

## Firebase-Specific Roles

| Role | Purpose | Assigned To |
|------|---------|-------------|
| `roles/firebase.admin` | Deploy rules, functions | CI/CD service account |
| `roles/firebase.viewer` | Read-only access | SRE team |
| `roles/firebaseauth.admin` | Manage users | Staff web portal |
| `roles/datastore.user` | Read/write Firestore | Functions, Web portal |

---

## Secret Manager Configuration

### 1. Create Secrets

```bash
# Gemini API Key
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --replication-policy="automatic" \
  --project=iconnect-prod

# SMS Provider API Key (when implemented)
echo -n "YOUR_SMS_API_KEY" | gcloud secrets create sms-api-key \
  --data-file=- \
  --replication-policy="automatic" \
  --project=iconnect-prod
```

### 2. Grant Function Access

```bash
# Grant Cloud Functions access to secrets
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:iconnect-prod@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=iconnect-prod
```

### 3. Update Functions to Use Secrets

```typescript
// functions/src/index.ts
import { defineSecret } from 'firebase-functions/params';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

export const generateGreeting = onCall(
  { 
    region: 'asia-south1',
    secrets: [geminiApiKey]  // Wire secret
  },
  async (request) => {
    const apiKey = geminiApiKey.value();
    // Use apiKey...
  }
);
```

---

## Audit Checklist

- [ ] No `roles/owner` beyond 1-2 admins
- [ ] No `roles/editor` assigned
- [ ] Service accounts follow least-privilege
- [ ] Secrets stored in Secret Manager (not env vars)
- [ ] Functions declare required secrets
- [ ] CI/CD uses service account key (not personal)
- [ ] Web portal uses dedicated service account
- [ ] Regular audit of IAM bindings (quarterly)

---

## Security Best Practices

1. **Rotate Keys Annually**: Service account keys
2. **Enable Audit Logs**: Track all IAM changes
3. **Use Workload Identity**: For GKE (if applicable)
4. **Review Permissions**: Quarterly IAM audit
5. **Alert on Changes**: Set up Cloud Monitoring alerts for IAM modifications
