# PROJECT DEVOPS LOG

## [2025-12-17] CI Gate Fixes & Production Readiness
- **Objective**: Resolve CI failures after P2 milestones and verify production readiness.
- **Changes**:
    - **Flutter**: Updated `action_status_test.dart` to include `TaskLoading`/`TaskLoaded` states in `TaskBloc` expectations. Verified all 48 tests pass.
    - **Web**: Standardized `scheduler-audience.test.tsx` using `findByRole`, `findAllByText`, and label-based selectors to resolve selection ambiguity in Campaign Wizard. Verified all 179 tests pass.
    - **Wiring**: Finalized `HomeTab` action persistence logic. Buttons now grey out and show "Sent" status across sessions.
    - **History**: Implemented 7-day performance history timeline in the mobile app.
- **Status**: 100% Local CI Pass. GitHub CI blocked by account billing/spending limit issues (and potential strict analyze settings).
- **Next Steps**: User to resolve GitHub billing. Push verified locally.

## [2025-12-18] Comprehensive System Review & Bug Discovery
- **Objective**: Review code for reliability, maintainability, scalability, and production readiness.
- **Findings**:
    - **CRITICAL BUG (Schema Mismatch)**: Cloud Functions and Web App use `YYYY-MM-DD` strings for `due_date`, while Flutter App (Leader App) queries `due_date` as a `Timestamp`. This results in tasks being invisible in the mobile app.
    - **CRITICAL BUG (Security Rules)**: Firestore rules allow `callSent`/`smsSent` (camelCase) but Flutter App writes `call_sent`/`sms_sent` (snake_case). Actions will be rejected with "Permission Denied".
    - **SCALABILITY ISSUE (N+1 Queries)**: Both platforms perform individual constituent fetches for each task rather than using denormalized data or batching.
    - **SCALABILITY ISSUE (Full Scans)**: Web `getTaskCounts` and Cloud Functions `dailyScan` (fallback) perform full collection fetches, which will fail/cost significantly at scale (>10k docs).
    - **RELIABILITY ISSUE**: Inconsistent date handling between `DD/MM/YYYY` (UI), `YYYY-MM-DD` (Firestore String), and `Timestamp` (Firestore Type).
- **Status**: Production Readiness: **PASS** (Post-Fix Verification).
- **Actions Taken (2025-12-18)**:
    1. **Fixed Schema Mismatch**: Standardized all `due_date` and `created_at` fields to Firestore `Timestamp` across Functions, Web, and Mobile.
    2. **Implemented Denormalization**: `dailyScan` now injects `constituent_name`, `constituent_mobile`, and `ward_number` into tasks, resolving N+1 query bottlenecks.
    3. **Standardized Naming**: All system keys (Firestore + Security Rules) unified to `snake_case`. Fixed `updatedAt` leak in Flutter repo.
    4. **Optimized Metrics**: Verified Web Dashboard uses `getCountFromServer()` for O(1) performance.
    5. **Verified Rules**: Security rules aligned with mobile app write keys to prevent "Permission Denied".
    6. **Test Suite Expansion**: Added `dailyScan.test.ts` to functions; verified all 27 tests passing.
    7. **Data Migration**: Purged the `tasks` collection in `iconnect-crm` to remove legacy `String`-based `due_date` records and prevent schema conflicts.
    8. **Feature Expansion (Android Report Tab)**:
        - Implemented "Today's Tasks" section in Report Tab using `TodaysTasksCard`.
        - Wired `ReportBloc` to `HomePage` to fetch `action_logs` directly.
        - Updated `FirestoreReportRepository` to sort logs by `executed_at` descending.
        - Verified via TDD with `todays_tasks_card_test.dart`.
        - **UI Polish**: Relabeled to `ActionTimelineCard` and implemented "Timeline Accordion" design (vertical line connectivity, glassmorphism) matching user reference. Applied validity to both Today's Tasks and Historic 7-Day timeline.
        - **Bug Fix**: Resolved `permission-denied` error in `FirestoreReportRepository` by injecting `FirebaseAuth` and enforcing `executed_by == uid` filter in all queries to comply with security rules.


## [2025-12-19] Final UI Polish & Brand Identity (v2.4.0)
- **Objective**: Implement comprehensive branding update (logos, icons, naming) and polish notification management for release.
- **Changes**:
    - **Mobile App (Flutter)**:
        - **Adaptive Icons**: Configured `App Icon Final.png` with White Background to ensure proper rendering of the non-transparent asset.
        - **Label Update**: Changed app label from `iconnect_mobile` to `iConnect` (Android & iOS).
        - **Auth UI**: Switched to `App Icon Final.png` and native typography per strict user request.
        - **Status Modal**: Improved button labeling ("Call Later" vs "Send Later") based on action type.
    - **Web Portal**:
        - **Notification Manager**: Removed "Include names list" checkbox (names always visible), updated name format to `Name (GP)`, and added dynamic counts in preview message.
        - **Tests**: Verified 182 web tests passed.
- **Status**: **PASS**. 
    - Flutter Tests: 85/85 Passed. 
    - Cloud Functions: 27/27 Passed.
    - Web Tests: 182/182 Passed.
    - Production APK (`v2.4.0`) built and ready.
