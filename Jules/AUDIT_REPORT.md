# Codebase Audit Report (Updated)

**Date:** 2024-12-11
**Auditor:** Jules

## Executive Summary

The codebase consists of a Flutter Mobile App, a React (Vite) Web App, a Next.js Web App (`iconnect-web`), and Firebase Cloud Functions. Recent additions include a comprehensive test suite.

**Critical Findings:**
1.  **Test Infrastructure Broken (New):** The recently added test files (`.spec.ts`, `_test.dart`) rely on dependencies that are missing from `package.json` and `pubspec.yaml`, rendering the test suite non-functional.
2.  **Security Vulnerability:** A backdoor in Firestore rules allows unauthenticated creation of constituents.
3.  **Missing Functionality:** Cloud Functions do not integrate with Gemini AI as claimed.
4.  **Scalability Issue:** The daily task scanner fetches the entire database daily.

---

## 1. Test Infrastructure Audit (New Findings)

### 1.1 Missing Mobile Test Dependencies
**File:** `pubspec.yaml`
**Issue:** The newly created test file `test/features/auth/presentation/bloc/auth_bloc_test.dart` imports:
- `package:bloc_test/bloc_test.dart`
- `package:mocktail/mocktail.dart`

However, `pubspec.yaml` **does not** list these dependencies in `dev_dependencies`.
**Impact:** Running `flutter test` will fail with compilation errors.
**Recommendation:** Add `bloc_test: ^9.0.0` and `mocktail: ^1.0.0` to `dev_dependencies`.

### 1.2 Missing Web E2E Dependencies
**File:** `iconnect-web/package.json`
**Issue:** The file `iconnect-web/e2e/auth.spec.ts` imports `@playwright/test`. This package is missing from `devDependencies`.
**Impact:** Playwright tests cannot be executed.
**Recommendation:** Run `npm install -D @playwright/test` in the `iconnect-web` directory.

### 1.3 Backend Test Configuration
**File:** `functions/package.json`
**Status:** `jest` and `ts-jest` are present.
**Issue:** The test file `functions/src/__tests__/dailyScan.test.ts` imports `../dailyScan`. Ensure `tsconfig.json` correctly resolves paths for tests outside the `src` root if configured that way (standard setup usually works).
**Observation:** `dailyScan.ts` correctly exports `scanForTasks`, so the logic is testable once the environment is set up.

---

## 2. Security Vulnerabilities (Existing)

### 2.1 Firestore Public Write Access (Critical)
**File:** `firebase/firestore.rules`
**Rule:** `allow create: if isStaff() || request.resource.data.tags.hasAny(['seeded']);`
**Impact:** Allows anyone to spam the database by adding a "seeded" tag.
**Recommendation:** Remove the `seeded` tag bypass immediately.

### 2.2 Client-Side Key Exposure
**File:** `services/gemini.ts` (Root App)
**Issue:** `process.env.API_KEY` is accessed in client-side code.
**Impact:** Potential leak of API keys if bundled.
**Recommendation:** Move AI logic to Cloud Functions.

---

## 3. Architecture & Scalability (Existing)

### 3.1 Daily Scan Scalability
**File:** `functions/src/dailyScan.ts`
**Issue:** `db.collection('constituents').get()` fetches all documents.
**Impact:** O(N) complexity will cause timeouts and high costs at scale.
**Recommendation:** Index by `dob_month` and `dob_day` for O(1) queries.

### 3.2 Mock vs Real Web App
**Issue:** The root Vite app uses mock data, while `iconnect-web` uses real Firebase.
**Recommendation:** Deprecate the root Vite app and focus on `iconnect-web`.

---

## 4. Code Quality

### 4.1 AI Implementation Missing
**File:** `functions/src/greeting.ts`
**Issue:** The function only uses hardcoded templates. Gemini integration is missing.
**Recommendation:** Implement the actual API call.

---

## 5. Next Steps

1.  **Fix Test Deps:** Update `pubspec.yaml` and `package.json` files to include missing test libraries.
2.  **Secure Database:** Update Firestore rules.
3.  **Optimize Backend:** Refactor `dailyScan` to use targeted queries.
4.  **Implement AI:** Connect `functions/src/greeting.ts` to Google GenAI.
