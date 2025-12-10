# Firebase Project Setup Guide

## Prerequisites
- Google Account
- Node.js 18+ installed

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `iconnect-crm`
4. Disable Google Analytics (optional, saves free tier quota)
5. Click **Create project**

## Step 2: Enable Services

### Firestore Database
1. In sidebar, click **Build → Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (we'll add rules later)
4. Choose region: `asia-south1` (Mumbai) for India
5. Click **Enable**

### Authentication
1. Click **Build → Authentication**
2. Click **Get started**
3. Under Sign-in providers, enable **Email/Password**

### Storage
1. Click **Build → Storage**
2. Click **Get started**
3. Select **Start in test mode**
4. Choose same region as Firestore

## Step 3: Get Web App Config

1. Click **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click the **Web** icon (`</>`)
4. Register app with name: `iconnect-web`
5. Copy the Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "iconnect-crm.firebaseapp.com",
  projectId: "iconnect-crm",
  storageBucket: "iconnect-crm.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

6. Save this config - we'll use it in Next.js

## Step 4: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init
```

When prompted:
- Select **Firestore**, **Functions**, **Storage**, **Emulators**
- Select existing project: `iconnect-crm`
- Accept default file locations
- For Functions: Choose **TypeScript**
- Install dependencies: **Yes**
- Enable emulators for local development

## Step 5: Set Gemini API Secret

```bash
cd functions
firebase functions:secrets:set GEMINI_API_KEY
# Paste your API key when prompted
```

## Free Tier Limits (Reference)

| Service | Free Limit |
|---------|------------|
| Firestore reads | 50,000/day |
| Firestore writes | 20,000/day |
| Cloud Functions invocations | 2M/month |
| Storage | 5GB |
| Auth | Unlimited users |

---

**Once complete, provide me with:**
1. ✅ Firebase project created
2. ✅ Firebase config object
3. ✅ Confirmation that CLI is logged in
