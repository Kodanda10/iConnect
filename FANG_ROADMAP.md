# FANG-Level Engineering Roadmap: iConnect CRM
**Date:** 2024-12-18
**Goal:** Elevate codebase to world-class engineering standards (Security, Scalability, Reliability).

## Phase 1: Foundation & Integrity (Stop the Bleeding)
*Priority: Critical | Est. Time: 1-2 Days*

Before adding fancy features or tests, we must ensure the system is secure and actually works.

1.  **Security Hardening (P0)**
    *   **Fix Firestore Rules:** Close the privilege escalation vulnerability immediately.
    *   **Lock Down Settings:** Remove public read access to `settings`.
    *   **Secret Management:** Move hardcoded keys (SenderID) to environment variables/Remote Config.

2.  **Data Contract Standardization (P0)**
    *   **Unify Data Model:** Refactor Backend (Cloud Functions) to write data in a format the Mobile App understands (standardize on `camelCase` for consistency with JS/Dart, or implement strict adapters).
    *   **Fix Migration:** Backfill existing data to match the new schema.

3.  **Wiring & Integration (P0)**
    *   **Mobile Notifications:** Implement `FirebaseMessaging` in Flutter (Request permissions, token sync, message handling).
    *   **Scalability Fix:** Implement `dob_month` / `dob_day` calculation triggers on Constituent creation/update to fix the O(N) daily scan crash risk.

## Phase 2: Testing Infrastructure (The "Safety Net")
*Priority: High | Est. Time: 2-3 Days*

Establish the "Test Pyramid" (70% Unit, 20% Integration, 10% E2E) to enable fearless refactoring.

1.  **Mobile (Flutter)**
    *   **Fix Dependencies:** Add `bloc_test`, `mocktail` to `pubspec.yaml`.
    *   **Unit Tests:** Coverage for all Blocs (`AuthBloc`, `TaskBloc`) and Repositories.
    *   **Widget Tests:** Smoke tests for critical screens (Login, Home, TaskList).

2.  **Web (Next.js)**
    *   **Unit/Integration:** Configure Jest + React Testing Library. Test utility functions and components.
    *   **E2E:** Configure Playwright for critical flows (Login -> Dashboard -> Create Task).

3.  **Backend (Functions)**
    *   **Unit:** Fix Jest config. Test `dailyScan` logic with mocked Firestore.
    *   **Integration:** Test Triggers using the Firebase Emulator Suite (avoid testing in production).

## Phase 3: CI/CD & Automation (The "Factory")
*Priority: Medium | Est. Time: 2 Days*

Automate the process to prevent regressions.

1.  **Pipeline Setup (GitHub Actions)**
    *   **PR Checks:** Block merging unless `flutter test`, `npm test`, `flutter analyze`, and `eslint` pass.
    *   **Security Scan:** Run `npm audit` and static analysis (SAST) on every push.
    *   **Auto-Deploy:**
        *   `main` branch -> Deploys to Firebase Hosting (Web) & Functions.
        *   `main` branch -> Deploys to Firebase App Distribution (Android/iOS) for QA.

2.  **Code Quality Gates**
    *   **Linting:** Enforce strict linter rules (pedantic for Flutter, Airbnb/Strict for TS).
    *   **Husky Hooks:** Prevent bad commits locally (pre-commit format/lint).

## Phase 4: Scalability & Performance (The "Scale")
*Priority: Low (initially) | Est. Time: Ongoing*

1.  **Async Processing**
    *   **Cloud Tasks:** Refactor `handleMeetingCreated` (unbounded loop) to use Google Cloud Tasks for robust, rate-limited bulk SMS sending.

2.  **Performance**
    *   **Image Optimization:** Use Next.js Image optimization and Flutter `cached_network_image`.
    *   **Database Indexing:** Ensure all complex queries (dashboard stats) have composite indexes.

3.  **Observability**
    *   **Monitoring:** Set up Firebase Crashlytics (Mobile) and Performance Monitoring (Web/Mobile).
    *   **Alerting:** Set up Cloud Function error alerts to Slack/Email.

---

## Execution Plan (Immediate Next Steps)

I recommend starting immediately with **Phase 1**, specifically:
1.  **Fix Firestore Rules** (Security)
2.  **Fix Data Model Mismatch** (Functionality)
3.  **Implement Mobile Notifications** (Engagement)
