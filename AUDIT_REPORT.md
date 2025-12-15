# Codebase Audit Report

**Date:** 2024-12-11
**Auditor:** Jules

## Executive Summary

The codebase consists of a Flutter Mobile App, a React (Vite) Web App, a Next.js Web App (`iconnect-web`), and Firebase Cloud Functions.

**Critical Findings:**
1.  **Security Vulnerability:** A backdoor in Firestore rules allows unauthenticated creation of constituents.
2.  **Missing Functionality:** The Cloud Functions do not actually integrate with Gemini AI as claimed; they rely solely on hardcoded templates.
3.  **Scalability Issue:** The daily task scanner fetches the entire database every day, which will cause performance degradation and high costs.
4.  **Architecture Discrepancy:** The root Web App (Vite) is a mock prototype using `localStorage` and does not connect to the Firebase backend. A separate, seemingly real Web App exists in `iconnect-web/` but appears to be a separate project.

---

## 1. Security Vulnerabilities

### 1.1 Firestore Public Write Access (Critical)
**File:** `firebase/firestore.rules`

The rule for `constituents` allows anyone to create a document if they include a specific tag, without requiring authentication.

```javascript
match /constituents/{constituentId} {
  // ...
  allow create: if isStaff() || request.resource.data.tags.hasAny(['seeded']);
  // ...
}
```
**Impact:** Malicious actors can spam the database with fake constituent data by simply adding `tags: ['seeded']` to the payload.
**Recommendation:** Remove the `seeded` tag check in production rules or strictly limit it to Admin SDKs (which bypass rules anyway).

### 1.2 Potential Client-Side Key Exposure
**File:** `services/gemini.ts` (in Root Web App)

The code accesses `process.env.API_KEY`. In a Vite client-side build, if this key is bundled, it will be exposed to the public.
**Recommendation:** Move AI generation to a backend endpoint (Cloud Functions) and call it from the client, rather than calling the AI API directly from the browser.

---

## 2. Architecture & Scalability

### 2.1 Daily Scan Scalability
**File:** `functions/src/dailyScan.ts`

The `dailyScan` function fetches **all** constituents every time it runs:

```typescript
const constituentsSnapshot = await db.collection('constituents').get();
```

**Impact:** This is an O(N) operation. As the user base grows (e.g., to 10,000 or 100,000 constituents), this function will time out and incur massive read costs.
**Recommendation:** Store `dob_day` and `dob_month` as separate fields on the `constituent` document to allow querying specific dates (e.g., `.where('dob_month', '==', currentMonth).where('dob_day', '==', currentDay)`).

### 2.2 Web App Disconnection
**Files:** Root `App.tsx` vs `iconnect-web/`

The project contains two distinct web applications:
1.  **Root (Vite):** Uses `services/db.ts` which mocks data in `localStorage`. **It does not connect to the real Firebase backend.**
2.  **`iconnect-web` (Next.js):** Contains real Firebase integration logic (`lib/firebase.ts`).

**Impact:** Users running `npm start` in the root will see a prototype with data that is completely disconnected from the Mobile App and Cloud Functions.
**Recommendation:** Clarify which web app is the production target. If `iconnect-web` is the real app, the root configuration should probably point to it or the Vite app should be updated to use Firebase.

---

## 3. Code Quality & Logic

### 3.1 Missing AI Implementation
**File:** `functions/src/greeting.ts`

The comment states: *"Uses templates as fallback when Gemini API is unavailable"*. However, the code **only** implements the fallback templates. There is no logic to call the Gemini API.

```typescript
export async function generateGreetingMessage(request: GreetingRequest): Promise<string> {
    // ... validation ...
    // Only template logic exists here
    const message = template.replace('{name}', request.name);
    return message;
}
```
**Impact:** The "AI Greeting" feature is fake.
**Recommendation:** Implement the actual Gemini API call in `functions/src/greeting.ts`.

### 3.2 Hardcoded Configuration
**Files:** `lib/features/action/data/repositories/firebase_greeting_repository.dart`, `iconnect-web/src/lib/firebase.ts`

Region `asia-south1` is hardcoded in multiple places.
**Recommendation:** Move configuration to environment variables or a central constants file.

### 3.3 Mobile App Error Handling
**File:** `lib/features/auth/data/repositories/firebase_auth_repository.dart`

Exceptions are caught and cast to `ServerFailure` strings.
**Recommendation:** Implement more granular error handling to distinguish between network errors, invalid credentials, and permission denied errors.

---

## 4. Next Steps

1.  **Immediate:** Fix `firestore.rules` to prevent unauthorized writes.
2.  **High:** Implement real Gemini integration in Cloud Functions.
3.  **High:** Optimize `dailyScan` to avoid full table scans.
4.  **Medium:** Decide on the Web App strategy (merge Vite logic with Firebase or use Next.js app) and archive the unused one.
