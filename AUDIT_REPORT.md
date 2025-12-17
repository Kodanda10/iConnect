# Codebase Audit Report
**Date:** 2024-12-18
**Scope:** Full Codebase (Mobile, Web, Backend)
**Status:** Review Complete

## Executive Summary
A comprehensive review of the `iconnect-mobile` (Flutter), `iconnect-web` (Next.js), and `functions` (Firebase Cloud Functions) repositories has been conducted.

**Critical Findings:**
1.  **Security Vulnerability:** A Critical privilege escalation flaw exists in Firestore rules allowing any user to become 'STAFF'.
2.  **Scalability Bottleneck:** The "optimized" daily scan logic is non-functional because data writes do not populate the required index fields (`dob_month`, `dob_day`), causing the system to default to a full database scan (O(N) memory usage).
3.  **Stability Risk:** Unbounded loops in Cloud Function triggers will cause timeouts as the user base grows.

---

## 1. Security & Permissions (CRITICAL)

### 1.1 Privilege Escalation in `firestore.rules`
**Severity:** CRITICAL
**Location:** `firebase/firestore.rules`
**Issue:**
The rule for creating a user document allows the client to explicitly set their role to 'STAFF':
```javascript
allow create: if isSignedIn() && request.auth.uid == userId
              && request.resource.data.role == 'STAFF';
```
**Impact:** Any authenticated user (including public sign-ups) can craft a request to create their profile with `role: 'STAFF'`. Once they are 'STAFF', they have full read/write access to Constituents, Tasks, and Festivals.

### 1.2 Public Access to Settings
**Severity:** HIGH
**Location:** `firebase/firestore.rules`
**Issue:**
```javascript
match /settings/{docId} {
  allow read: if true;
}
```
**Impact:** The `settings` collection is readable by unauthenticated users. If this collection stores internal configuration, feature flags, or keys, they are exposed to the public.

---

## 2. Backend & Cloud Functions (High Priority)

### 2.1 Broken Optimization in `dailyScan` (O(N) Memory Crash Risk)
**Severity:** HIGH
**Location:** `functions/src/index.ts`
**Issue:**
The `dailyScan` function attempts to query by `dob_month` and `dob_day` to avoid loading the entire database. However, a codebase search reveals that **these fields are never written**.
*   `lib/` (Flutter App): Does not write `dob_month`/`dob_day`.
*   `functions/src/triggers.ts`: No trigger exists to backfill these fields on creation.
*   **Result:** The `try` block in `dailyScan` always fails (returns 0 results or error), forcing the `catch` block to execute:
    ```typescript
    // Fallback to full scan
    const constituentsSnapshot = await db.collection('constituents').get();
    ```
**Impact:** As the database grows, this function will attempt to load ALL constituents into memory, causing an "Out of Memory" crash or execution timeout, stopping all birthday/anniversary tasks.

### 2.2 Unbounded Loop in `handleMeetingCreated`
**Severity:** MEDIUM
**Location:** `functions/src/triggers.ts`
**Issue:**
The function iterates over `notified_constituents` to send SMS messages:
```typescript
const promises = constituents.map(async (c: any) => { ... await sendSMS(...) });
await Promise.all(promises);
```
**Impact:** If a meeting is created with hundreds or thousands of constituents, this function will hit the 60s (or 540s) execution timeout, causing the operation to fail partially.

### 2.3 Silent Failure for Gemini API
**Severity:** LOW
**Location:** `functions/src/greeting.ts`
**Issue:**
Dependencies on `process.env.GEMINI_API_KEY` are handled with a silent fallback. While safe, it may mask configuration errors in production.

---

## 3. Mobile App (Flutter)

### 3.1 Hardcoded UI Styling
**Severity:** LOW
**Location:** `lib/main.dart`
**Issue:**
System UI colors are hardcoded:
```dart
statusBarColor: Colors.transparent, // vs AppColors.bgGradientStart
```
**Impact:** Inconsistent theming if `AppTheme` changes.

### 3.2 Missing Data Fields
**Severity:** HIGH (Related to 2.1)
**Location:** `lib/features/constituents` (Implied)
**Issue:**
The mobile app creates constituents but fails to calculate and save `dob_month` and `dob_day`. This directly contributes to the backend scalability failure.

---

## 4. Web App (Next.js)

### 4.1 Debug Logs in Production Code
**Severity:** LOW
**Location:** `iconnect-web/src/app/(dashboard)/settings/page.tsx`
**Issue:**
Multiple `console.log('[DEBUG] ...')` statements are present in what appears to be production code.

---

## Recommendations

1.  **Fix Firestore Rules Immediately:** Remove the check that *requires* `role == 'STAFF'` on create. Instead, force `role` to be 'USER' or 'GUEST' on creation, or use a Cloud Function trigger to assign roles safely.
2.  **Implement Write Triggers:** Create a Firestore trigger (`onConstituentCreated` / `onConstituentUpdated`) in `functions/src` that automatically calculates and saves `dob_month`, `dob_day`, `anniversary_month`, and `anniversary_day`.
3.  **Refactor Bulk Notifications:** Move the SMS broadcasting in `handleMeetingCreated` to a Task Queue (Google Cloud Tasks) to handle large batches asynchronously without timeouts.
4.  **Clean Up:** Remove `console.log` from production files and fix hardcoded styles in Flutter.
