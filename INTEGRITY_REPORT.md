# iConnect Architecture & Integrity Report

**Date:** 2025-12-18
**Auditor:** Jules (AI Software Engineer)
**Scope:** Full Architecture Review (Backend, Mobile, Web)

---

## 1. Executive Summary

The iConnect ecosystem demonstrates a solid architectural foundation with a clear separation of concerns between the Firebase backend, Flutter mobile app, and Next.js web portal. The core data models for Constituents and Tasks are well-aligned across platforms, with robust handling of legacy schema differences (snake_case vs camelCase).

However, a **critical integration gap** exists in the Mobile Application regarding the "Meetings" feature. While the UI and Business Logic (BLoC) layers exist, the Data layer (Repository) is missing, rendering the feature non-functional on mobile.

## 2. Critical Issues (P0)

### 🚨 1. Missing Mobile Implementation for Meetings
*   **Issue:** The Flutter app contains `MeetingsBloc` and `ScheduledMeeting` entity, but **no implementation of `MeetingsRepository` exists**.
*   **Impact:** The app will likely crash or fail to build if this feature is accessed. The `injection_container.dart` file does not register a `MeetingsRepository`, confirming it is not wired up.
*   **Recommendation:** Implement `FirestoreMeetingsRepository` in `lib/features/meetings/data/repositories/` and register it in `injection_container.dart`.

### 🚨 2. Security Risk in Firestore Rules
*   **Issue:** The `scheduled_notifications` collection has `allow read, write: if false;`. While this prevents public access, it relies entirely on the Admin SDK.
*   **Risk:** If the Admin SDK logic (Cloud Functions) has bugs, there is no second layer of defense.
*   **Recommendation:** Keep as is for now if strict server-side only access is desired, but ensure `functions/src/notifications.ts` is rigorously tested.

## 3. Data Integrity & Schema Consistency

### ✅ Snake_case vs CamelCase Strategy
*   **Status:** **PASSED** (With notable robustness)
*   **Backend:** Writes `snake_case` (e.g., `dob_month`, `constituent_id`) in `dailyScan.ts` and triggers.
*   **Mobile:** `TaskModel.fromFirestore` correctly handles this by looking for `snake_case` keys *first*, falling back to `camelCase`. This prevents the "data visibility failure" mentioned in earlier contexts.
*   **Web:** `constituents.ts` correctly transforms frontend `camelCase` data to `snake_case` (e.g., `dob_month`) before writing to Firestore.

### ✅ Database Optimization
*   **Status:** **PASSED**
*   **Optimization:** The `dailyScan` function uses `dob_month` and `dob_day` integer fields for O(1) query performance, avoiding inefficient full-collection scans.
*   **Fallback:** It creates a safety net by falling back to a full scan if the optimized index returns zero results (likely for legacy data support).

## 4. Component Analysis

### ☁️ Backend (Firebase Cloud Functions)
*   **Notification Pipeline:** `triggers.ts` correctly identifies "New Meeting" events and calculates notification times (`eveningBefore`, `tenMinBefore`).
*   **Scalability Concern:** `handleMeetingCreated` contains a loop for sending SMS:
    ```typescript
    for (let i = 0; i < mobiles.length; i += BATCH_SIZE) { ... }
    ```
    While it has a `DIRECT_SEND_THRESHOLD` to offload to Cloud Tasks, the direct send path could still timeout if the batch size logic fails or external API is slow.
*   **Mock Services:** SMS is currently mocked (`messaging.ts`). This is acceptable for dev but a blocker for production.

### 📱 Mobile App (Flutter)
*   **Push Notifications:** `FCMService` is implemented and initialized in `main.dart`.
*   **Architecture:** Follows Clean Architecture (Domain -> Data -> Presentation).
*   **State Management:** Uses `flutter_bloc` effectively.

### 🌐 Web Portal (Next.js)
*   **Tech Stack:** Modern Next.js 14+ setup.
*   **Security:** Uses `process.env` for Firebase keys.
*   **Data Access:** Service layer (`lib/services/`) provides a clean abstraction over Firestore, ensuring types (`Constituent`, `Task`) are respected.

## 5. DevOps & Maintainability

*   **CI/CD:** `.github/workflows/ci.yml` covers:
    *   Flutter Android Build (Debug)
    *   Next.js Web Build
    *   Cloud Functions Build
    *   **Gap:** No "Release" build for Android (only Debug). No deployment steps (CD) configured yet.
*   **Hardcoded Values:**
    *   `lib/firebase_options.dart` contains mock keys. These must be replaced with real values from a secure vault during the build process for production.

## 6. Recommendations

1.  **Immediate Fix:** Create `lib/features/meetings/data/repositories/firestore_meetings_repository.dart` in the Flutter app.
2.  **Scalability:** Verify the `Cloud Tasks` queue `sendMeetingSmsBatch` is actually deployed and configured in GCP, otherwise the SMS fallback will be the only (fragile) method.
3.  **Production Prep:** Replace mock SMS service in `functions/src/messaging.ts` with a real provider (Twilio/Msg91).
