# System Integrity & Wiring Report
**Date:** 2024-12-18
**Scope:** Architecture, Integrations, and Data Flow (Mobile, Web, Backend)
**Status:** **CRITICAL FAILURES DETECTED**

## Executive Summary
A deep architectural review reveals a **fundamental disconnection** between the Mobile Application, Web Portal, and Backend Cloud Functions. The system is currently fragmented, with different components speaking different "languages" (data models) and missing critical "wires" (implementations).

**Top 3 Integrity Failures:**
1.  **"Tower of Babel" Data Model:** The Backend writes data in `snake_case` (e.g., `constituent_id`), while the Mobile App expects `camelCase` (e.g., `constituentId`). This results in the Mobile App failing to display critical data (Tasks, Dates) even if the database is populated.
2.  **Dead Notification Wiring:** The Mobile App includes the *dependencies* for Push Notifications but contains **zero implementation code** to initialize, request permissions, or handle messages. Notifications sent by the backend will never be received.
3.  **Broken Scalability Loop:** The "Daily Scan" function relies on database fields (`dob_month`) that are defined in the schema but **never written** by any application, guaranteeing performance degradation (O(N) scans) and eventual system crash.

---

## 1. Wiring Diagram & Gap Analysis

### 1.1 Push Notifications
*   **Backend (`functions/src`):**
    *   ✅ **Source:** `sendPushNotification` (FCM) is implemented.
    *   ✅ **Trigger:** `handleMeetingCreated` correctly attempts to send notifications.
*   **Mobile App (`lib/`):**
    *   ❌ **Receiver:** **MISSING.** There is no code to initialize `FirebaseMessaging`, request user permission, or handle incoming messages.
    *   ❌ **Token Sync:** There is no logic to upload the device's FCM token to the Firestore `users` collection.
*   **Verdict:** **disconnected**. The backend shouts into the void; the app is deaf.

### 1.2 SMS & WhatsApp
*   **Backend:**
    *   ⚠️ **Implementation:** `sendSMS` is currently a **Mock** (logs to console only).
    *   ⚠️ **Wiring:** The `dailyScan` creates tasks, but there is no automated trigger to *send* the greeting. It relies on manual action.
*   **Verdict:** **Prototype Only**. Not wired for production.

### 1.3 Database Sync (The "Split Brain")
*   **Web Portal (`iconnect-web`):**
    *   Writes to `tasks` collection using mixed cases (checked `services/tasks.ts` - creates `created_at` snake_case, but reads `dueDate` camelCase in types).
    *   **Inconsistent:** The TypeScript interfaces define `constituentId` (camelCase), but the raw Firestore writes in `dailyScan` (Backend) use `constituent_id` (snake_case).
*   **Mobile App (`iconnect-mobile`):**
    *   Reads `constituentId` (camelCase).
    *   **Result:** When the Backend creates a task (snake_case), the Mobile App reads it and sees `null` for `constituentId`.
*   **Verdict:** **Broken**. The Data Contract is violated across all three platforms.

---

## 2. Detailed Findings

### 2.1 Critical Data Model Mismatch
**Severity:** CRITICAL
**Impact:** App functionality (Tasks, Calendar) is broken.
*   **Backend (`dailyScan.ts`):** Writes `{ constituent_id: "...", due_date: "..." }`
*   **Mobile (`TaskModel.fromFirestore`):** Reads `data['constituentId']` and `data['dueDate']`.
*   **Consequence:** The mobile app will load the task document but fail to parse the fields, likely resulting in crashes or empty UI tiles.

### 2.2 Missing Mobile Notification Layer
**Severity:** CRITICAL
**Impact:** Zero user engagement/retention.
*   Dependencies (`firebase_messaging`) exist in `pubspec.yaml`.
*   **Gap:** No `FirebaseMessaging.instance.getToken()` call. No `FirebaseMessaging.onMessage.listen()` handler. The app is invisible to FCM.

### 2.3 Secrets & Configuration Security
**Severity:** MEDIUM
**Impact:** Deployment Risk.
*   **Good:** `functions` use `process.env.GEMINI_API_KEY`.
*   **Bad:** Mobile App has hardcoded `messagingSenderId` in `firebase_options.dart`. While standard for Firebase, other secrets (if added) must not follow this pattern.
*   **Bad:** `dailyScan` logic is hardcoded to specific timezones and behaviors without feature flags.

### 2.4 Scalability: The Missing Index
**Severity:** HIGH
**Impact:** System paralysis after ~5,000 users.
*   **Issue:** `dailyScan` attempts to use `dob_month` for O(1) lookups.
*   **Gap:** neither the Mobile App nor the Web Portal calculates or writes `dob_month` when saving a Constituent.
*   **Result:** The "Optimization" block in the backend throws an error/returns empty, forcing the "Full Scan" (O(N)) every single night.

---

## 3. Reliability & Maintainability

*   **Error Boundaries:** The Cloud Functions generally lack `try/catch` blocks inside the async loops (e.g., `triggers.ts`). If one SMS fails in a batch of 100, the entire function might crash, leaving the remaining 99 users un-notified.
*   **Type Safety:** The TypeScript projects (`web` and `functions`) share *similar* but *separate* type definitions. This duplication is the root cause of the "snake_case vs camelCase" bug. They should share a common `packages/types` module or strictly enforce a single source of truth.

## Recommendations

1.  **Standardize Data Model:** Immediate decision required: **snake_case** or **camelCase** for Firestore.
    *   *Recommendation:* Use **snake_case** for Firestore keys (standard DB practice) and write adapters in the Mobile/Web layers to convert to **camelCase** for internal app usage.
    *   *Action:* Rewrite `TaskModel.fromFirestore` (Mobile) and `dailyScan.ts` (Backend) to agree.
2.  **Implement Mobile Notifications:**
    *   Add `NotificationService` in Flutter.
    *   Call `requestPermission()` on app launch.
    *   Sync FCM Token to `users/{uid}` in Firestore.
3.  **Fix Constituent Writes:**
    *   Update Mobile and Web "Create Constituent" forms to calculate and save `dob_month`, `dob_day`, `anniversary_month`, `anniversary_day`.
    *   Run a migration script to backfill these fields for existing data.
4.  **Shared Types:** Create a shared logic/constants file (or strictly copy-paste with comments) to ensure Web and Cloud Functions use identical field names.
