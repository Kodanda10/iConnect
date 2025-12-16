# Master Test Strategy: iConnect CRM (FANG-Level)

**Date:** 2024-12-11
**Architect:** Jules

This document outlines the comprehensive testing strategy to ensure zero-downtime, high availability, and regression-free releases for the iConnect CRM ecosystem (Mobile, Web, Backend).

---

## 1. Testing Philosophy
We adhere to the **Testing Pyramid** but with "FANG-level" emphasis on automated integration and resilience testing.

1.  **Unit Tests (70%):** Fast, isolated tests for business logic (Blocs, Hooks, Functions).
2.  **Integration/Widget Tests (20%):** Testing interactions between components (Pages, API Clients).
3.  **E2E Tests (10%):** Full system flows on emulators/browsers (Critical User Journeys).
4.  **Resilience/Chaos Tests:** Testing fallbacks (Offline mode, API failures).
5.  **Performance Tests:** Load testing backend endpoints.

---

## 2. Tech Stack & Tools

| Platform | Type | Framework/Tool | Scope |
| :--- | :--- | :--- | :--- |
| **Mobile (Flutter)** | Unit | `flutter_test`, `mockito`, `bloc_test` | Blocs, Repositories, UseCases |
| | Widget | `flutter_test`, `golden_toolkit` | Pixel-perfect UI, Interactions |
| | E2E | `integration_test` (Patrol) | Full app flows (Login -> Task) |
| **Web (Next.js)** | Unit | `Jest`, `React Testing Library` | Components, Hooks, Utils |
| | E2E | `Playwright` | Cross-browser flows, Mobile web |
| **Backend (Functions)** | Unit | `Jest`, `firebase-functions-test` | Logic, Triggers |
| | Integration | `firebase-emulators` | Firestore/Auth interaction |
| **Performance** | Load | `k6` | Cloud Function stress testing |

---

## 3. Critical User Journeys (CUJs)
These flows *must* pass before any release.

1.  **Authentication:** Login, Logout, Session Persistence.
2.  **Daily Workflow:** View Tasks -> Filter -> Execute Action (Call/SMS) -> Mark Complete.
3.  **Data Entry:** Add Constituent -> Validate -> Upload.
4.  **Resilience:** App opens offline -> Shows cached data -> Syncs when online.

---

## 4. Detailed Test Plan

### 4.1 Flutter Mobile App
*   **Architecture:** Clean Architecture (Presentation, Domain, Data).
*   **Unit Tests:**
    *   `AuthBloc`: Test Login Success/Fail, Session Check.
    *   `TaskBloc`: Test Load Tasks, Filter, Complete Task.
    *   `Repositories`: Mock DataSources and verify mapping/error handling.
*   **Widget Tests:**
    *   `LoginPage`: Verify form validation (Email/Pass required).
    *   `TaskCard`: Verify different states (Pending, Completed, Birthday vs Anniversary).
    *   **Sustainability:** Ensure widgets handle large text (overflow) and different screen sizes.

### 4.2 Web Portal (Next.js)
*   **Unit Tests:**
    *   `hooks/useAuth`: Verify auth state management.
    *   `components/Dashboard`: Verify layout rendering.
*   **Playwright E2E:**
    *   Login flow (Staff vs Leader).
    *   Navigate to Scheduler.
    *   Upload CSV and verify validation errors.

### 4.3 Backend (Cloud Functions)
*   **Unit Tests:**
    *   `dailyScan`: Mock Firestore. Verify task creation logic (dates, duplicates).
    *   `generateGreeting`: Verify template fallback if AI fails.
*   **Performance:**
    *   k6 script to hit `generateGreeting` with 100 concurrent users.

---

## 5. Security & Sustainability Checks

*   **Static Analysis:**
    *   Flutter: `flutter analyze` (custom strict rules).
    *   Web/Functions: `ESLint` (Airbnb config).
*   **Dependency Scanning:** `npm audit`, `trivy`.
*   **Fallback Testing:** All API calls must have `try-catch` blocks with local fallback logic (e.g., if Gemini fails, use local template).

---

## 6. Execution Strategy (CI/CD)

*   **PR Check:** Unit Tests + Linting.
*   **Nightly:** E2E Tests on Dev Environment.
*   **Release:** Full Regression Suite + Load Test.

