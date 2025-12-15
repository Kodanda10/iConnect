# System Enhancement & Maintenance Report

**Date:** 2024-12-11
**Reviewer:** Jules

This report outlines recommended improvements for the iConnect CRM system, focusing on architecture, security, maintainability, and iOS readiness.

---

## 1. System Architecture

### 1.1 Web Application Consolidation
**Observation:** The codebase currently contains two distinct web applications:
1.  **Root (Vite + React):** `App.tsx` (Mock data, local storage).
2.  **`iconnect-web` (Next.js):** Production-ready structure with Firebase integration.

**Recommendation:**
*   **Deprecate the Root App:** Move the `App.tsx` logic or any unique components (like `StaffPortal.tsx`, `LeaderApp.tsx`) into the `iconnect-web` project.
*   **Standardize on Next.js:** The `iconnect-web` project is better set up for production with authentication and routing. Use this as the single source of truth for the web platform.
*   **Cleanup:** Remove `vite.config.ts`, `index.html`, and root `package.json` to avoid confusion for new developers.

### 1.2 Backend Scalability (Cloud Functions)
**Observation:** The `dailyScan` function performs a full collection read (`db.collection('constituents').get()`) every day.
**Recommendation:**
*   **Query Optimization:** Add `dob_month` and `dob_day` fields to the `constituents` documents.
*   **Targeted Queries:** Update `dailyScan` to query only documents matching today's month/day, reducing complexity from O(N) to O(1) (relative to total database size).

### 1.3 State Management & Logic Sharing
**Observation:** Business logic (e.g., greeting generation templates) is duplicated between the Cloud Functions (`functions/src/greeting.ts`) and the Flutter app (`services/greetings.ts` - wait, this file path seems to be from the root web app, not Flutter). The Flutter app relies on BLoC.
**Recommendation:**
*   **Centralize Logic:** Move all "Greeting Generation" logic strictly to the Cloud Function. The client (Mobile/Web) should only request a greeting and display the result. This ensures consistent messaging across platforms and allows updating templates without app store releases.

---

## 2. Security Enhancements

### 2.1 Firestore Rules
**Recommendation:**
*   **Remove Backdoors:** Eliminate the `allow create: if ... tags.hasAny(['seeded'])` rule immediately in production.
*   **Role-Based Access Control (RBAC):** Strictly enforce `isStaff()` for write operations.
*   **Data Validation:** Add schema validation rules (e.g., `request.resource.data.name is string`, `request.resource.data.mobile_number.matches('^\\d{10}$')`).

### 2.2 API Key Management
**Observation:** The root web app references `process.env.API_KEY` for Gemini.
**Recommendation:**
*   **Server-Side Only:** Never expose the Gemini API key in client-side code. All AI requests must go through the `generateGreeting` Cloud Function, which can securely access the key from Google Cloud Secret Manager or Firebase Environment Configuration.

### 2.3 iOS Specific Security
**Recommendation:**
*   **App Transport Security (ATS):** Ensure `Info.plist` is configured to allow network requests only to HTTPS endpoints (default in iOS, but worth verifying if custom domains are used).
*   **Permissions:** Explicitly define usage descriptions in `Info.plist` for any hardware access (e.g., `NSPhotoLibraryUsageDescription` if profile picture upload is added).

---

## 3. Code Maintainability & Automation

### 3.1 CI/CD Pipeline (GitHub Actions)
**Observation:** A basic workflow exists (`.github/workflows/ci.yml`) covering Android, Web, and Functions.
**Recommendation:**
*   **Add iOS Job:** Create a new job for iOS builds.
    ```yaml
    ios-build:
      runs-on: macos-latest
      steps:
        - uses: actions/checkout@v3
        - uses: subosito/flutter-action@v2
        - run: flutter build ios --release --no-codesign
    ```
    *Note: Full signing requires Apple Developer Certificate secrets management.*
*   **Linting Gates:** Enforce `flutter analyze` and `npm run lint` as blocking steps for any Pull Request.

### 3.2 Dependency Management
**Recommendation:**
*   **Renovate / Dependabot:** Enable GitHub Dependabot to automatically open PRs for outdated dependencies in `pubspec.yaml` and `package.json`.
*   **Version Pinning:** Use caret syntax (`^`) carefully. For critical production apps, consider pinning exact versions or using `pubspec.lock` / `package-lock.json` integrity checks in CI.

### 3.3 Documentation
**Recommendation:**
*   **Architecture Decision Records (ADRs):** Start a `docs/adr/` folder to document why decisions (like using Next.js over Vite, or BLoC over Riverpod) were made.
*   **API Documentation:** Use Swagger/OpenAPI or a simple Markdown file to document the Cloud Functions inputs/outputs (`functions/docs/api.md`).

---

## 4. iOS App Build Strategy

**Status:** The `ios/` directory exists but is minimal.
**Actions Required:**
1.  **CocoaPods:** Ensure `Podfile` is up to date. Run `pod install` in `ios/` directory locally to generate the workspace.
2.  **Signing & Capabilities:**
    -   You will need an Apple Developer Account.
    -   Configure "Signing & Capabilities" in Xcode (Team, Bundle Identifier).
    -   Setup `fastlane` for automated beta distribution (TestFlight).
3.  **Firebase Setup:**
    -   You need to add `GoogleService-Info.plist` to the `ios/Runner` directory (downloaded from Firebase Console). **Do not commit this if it contains sensitive keys (though usually safe for Firebase, standard practice varies).**

---

## 5. Summary Roadmap

| Priority | Area | Task |
| :--- | :--- | :--- |
| **Critical** | Security | Fix Firestore Rules (Remove `seeded` tag bypass). |
| **High** | Architecture | Consolidate Web Apps (Move to Next.js). |
| **High** | Backend | Optimize `dailyScan` Cloud Function (O(1) complexity). |
| **Medium** | DevOps | Add iOS Build step to CI pipeline. |
| **Medium** | DevOps | Enable Dependabot for auto-updates. |
| **Low** | Docs | Create API documentation. |
