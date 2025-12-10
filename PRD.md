# Product Requirements Document (PRD): iConnect Ecosystem

**Version:** 1.0
**Status:** Approved for Development
**Date:** October 26, 2023
**Author:** Lead Solution Architect

---

## 1. Executive Summary
iConnect is a Constituent Relationship Management (CRM) ecosystem designed to bridge the gap between political backend staff and the political leader.
*   **Staff** use a Web Dashboard to manage data, configure app visuals, and schedule events.
*   **Leaders** use a Mobile App (Android/iOS) to execute high-touch engagement actions (Calls, SMS, WhatsApp) based on daily triggers (Birthdays, Anniversaries, Festivals).

---

## 2. Technical Stack & Architecture

### 2.1 High-Level Architecture
The system follows a **Serverless, Event-Driven Architecture** utilizing Google Firebase as the backend-as-a-service (BaaS). This ensures real-time data synchronization between the Web CMS and the Flutter Mobile App.

### 2.2 Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Web App (Admin)** | **React.js (Vite)** + **Tailwind CSS** | Matches existing prototype, high performance, rapid development. |
| **Mobile Apps** | **Flutter** (Dart) | Single codebase for iOS/Android, native performance, excellent deep-linking support (`url_launcher`). |
| **Backend / DB** | **Firebase Firestore** (NoSQL) | Real-time listeners allow the Mobile App to update instantly when Staff changes settings on Web. |
| **Authentication** | **Firebase Auth** | Secure login, session management, and RBAC (Role-Based Access Control). |
| **File Storage** | **Firebase Storage** | Hosting Leader Header Images and Profile Pictures. |
| **Server-Side Logic** | **Firebase Cloud Functions** (Node.js) | Secures Gemini API keys, runs daily cron jobs ("System Brain"), and handles image compression. |
| **AI Engine** | **Google Gemini 2.5 Flash** | Low latency text generation for greetings. |

### 2.3 Database Schema (Firestore)

The database will use a collection-document structure.

**Collections:**

1.  **`users`**
    *   `uid` (String): Auth ID
    *   `role` (String): 'STAFF' | 'LEADER'
    *   `name` (String)
    *   `email` (String)

2.  **`settings`** (Singleton Document ID: `app_config`)
    *   `appName` (String)
    *   `leaderName` (String)
    *   `headerImageUrl` (String): URL from Firebase Storage.
    *   `profilePictureUrl` (String): URL from Firebase Storage.
    *   `alertSettings`: { `headsUp`: Boolean, `action`: Boolean }

3.  **`constituents`**
    *   `id` (Auto-ID)
    *   `name` (String)
    *   `mobile` (String)
    *   `dob` (Timestamp)
    *   `anniversary` (Timestamp, Optional)
    *   `ward` (String)
    *   `address` (String)
    *   `block` (String)
    *   `gp_ulb` (String)

4.  **`tasks`**
    *   `id` (Auto-ID)
    *   `constituentId` (Reference)
    *   `type` (String): 'BIRTHDAY' | 'ANNIVERSARY'
    *   `status` (String): 'PENDING' | 'COMPLETED'
    *   `dueDate` (String): YYYY-MM-DD
    *   `actionTaken` (String): 'CALL' | 'SMS' | 'WHATSAPP' | null
    *   `notes` (String)
    *   `completedBy` (String): 'LEADER' | 'STAFF'

5.  **`festivals`**
    *   `id` (Auto-ID)
    *   `name` (String)
    *   `date` (String): YYYY-MM-DD
    *   `description` (String)
    *   `aiPromptContext` (String): Metadata to help Gemini generate specific wishes.

---

## 3. Detailed Feature Specifications

### 3.1 Authentication & Role Management
*   **Login Flow:** Email/Password login via Firebase Auth.
*   **Staff View:** Upon login, if role is `STAFF`, route to Admin Dashboard (Web).
*   **Leader View:** Upon login, if role is `LEADER`, route to Mobile Task Feed (Flutter).
*   **Security:** Firestore Security Rules must prevent `LEADER` role from writing to `settings` or deleting `constituents`.

### 3.2 Profile & Visual Management (The "Vanishing Data" Fix)
Currently, data relies on LocalStorage. In production:
1.  **Image Upload (Web):**
    *   Staff selects an image (Header or Profile).
    *   Web App uploads Blob to Firebase Storage bucket: `/images/header.jpg`.
    *   Get Download URL (e.g., `https://firebasestorage...`).
    *   Update `settings/app_config` document with the new URL.
2.  **Image Rendering (Mobile):**
    *   Flutter app listens to `settings/app_config` stream.
    *   Uses `CachedNetworkImage` widget to display the header.
    *   *Result:* Persistence across sessions and devices is guaranteed.

### 3.3 Smart Scheduler ("System Brain")
Instead of the client-side loop in `db.ts`, we implement a **Cloud Function (Cron Job)**:
*   **Trigger:** Runs daily at 00:01 AM.
*   **Logic:**
    1.  Query `constituents` where `dob` (Day/Month) == Today.
    2.  Query `constituents` where `anniversary` (Day/Month) == Today.
    3.  Create documents in `tasks` collection with status `PENDING`.
*   **Festival Logic:** Staff adds a festival to the `festivals` collection via Web. Cloud Function creates a "Campaign Task" for the Leader on that specific date.

### 3.4 AI Integration (Gemini)
**Workflow:**
1.  **User Action:** Leader clicks "Generate Wish" (or "Rewrite with AI") in the mobile app drawer.
2.  **Request:** Flutter app calls Firebase Cloud Function `generateGreeting`.
    *   *Payload:* `{ name: "Rahul", type: "BIRTHDAY", language: "ODIA", ward: "12" }`
3.  **Processing:** Cloud Function initializes Google GenAI client (using server-side ENV variable for API_KEY).
4.  **Prompt Engineering:**
    *   *System:* "You are a political leader. Tone: Warm, Professional."
    *   *User:* "Write a birthday wish in Odia for Rahul from Ward 12."
5.  **Response:** Returns text string to Flutter app.
6.  **UI:** Text creates a pre-filled message body.

### 3.5 Communication & Deep Linking
The Mobile App must interact with the OS using the `url_launcher` package.
*   **Call:** `launchUrl(Uri.parse("tel:+919876543210"))`
*   **SMS:** `launchUrl(Uri.parse("sms:+919876543210?body=Happy Birthday..."))`
*   **WhatsApp:**
    *   *Android:* `launchUrl(Uri.parse("whatsapp://send?phone=+919876543210&text=Happy Birthday..."))`
    *   *iOS:* `launchUrl(Uri.parse("https://wa.me/919876543210?text=..."))`

---

## 4. Project Structure & Code Organization

### 4.1 Flutter Project Structure (Clean Architecture)
This ensures the mobile app is scalable and testable.

```text
lib/
├── core/
│   ├── constants/       (App strings, API endpoints)
│   ├── theme/           (Colors, Fonts matching Tailwind config)
│   ├── utils/           (Date formatters, UrlLauncher helpers)
│   └── widgets/         (Reusable buttons, input fields)
├── data/
│   ├── datasources/
│   │   ├── auth_remote_source.dart
│   │   ├── firestore_source.dart  (Constituents, Tasks)
│   │   └── gemini_source.dart     (Cloud function calls)
│   ├── models/          (TaskModel, ConstituentModel - fromJson/toJson)
│   └── repositories/    (Implementation of Domain Repositories)
├── domain/
│   ├── entities/        (Pure Dart classes: Task, Constituent)
│   ├── repositories/    (Abstract interfaces)
│   └── usecases/        (GetDailyTasks, CompleteTask, UploadImage)
├── presentation/
│   ├── bloc/            (State Management: AuthBloc, TaskBloc)
│   ├── pages/
│   │   ├── login_page.dart
│   │   ├── home/
│   │   │   ├── home_page.dart
│   │   │   └── widgets/   (HeaderCard, TaskList, FloatingFilters)
│   │   └── task_detail/
│   │       └── task_action_sheet.dart (The bottom sheet for Calling/AI)
│   └── routes/
└── main.dart
```

### 4.2 Web Project Structure (Next.js)

```text
src/
├── app/                 (App Router)
│   ├── login/
│   ├── dashboard/       (CMS Layout)
│   │   ├── scheduler/
│   │   ├── upload/
│   │   └── settings/    (Visual customization)
│   └── api/             (Local API proxies if needed)
├── components/
│   ├── ui/              (Tailwind components: Cards, Buttons)
│   ├── features/
│   │   ├── MobilePreview.tsx
│   │   ├── CsvUploader.tsx
│   │   └── CalendarGrid.tsx
├── lib/
│   ├── firebase.ts      (Firebase Client Init)
│   ├── gemini.ts        (Client wrapper)
│   └── db.ts            (Firestore CRUD functions)
├── types/
└── hooks/               (useAuth, useTasks)
```

---

## 5. Integration Logic & Roadmap

### 5.1 Real-time Sync Logic
*   **Web Trigger:** Staff uploads a new header image via `StaffPortal.tsx`.
*   **Action:**
    1.  Image saved to Firebase Storage.
    2.  `settings/app_config` document updated with `headerImageUrl`.
*   **Mobile Reaction:**
    1.  Flutter app has a `StreamBuilder` listening to `settings` collection.
    2.  Snapshot updates.
    3.  `CachedNetworkImage` detects URL change and re-renders the header instantly without app restart.

### 5.2 Development Phases

**Phase 1: Foundation (Backend)**
*   Setup Firebase Project. or Provide alternative to the Human before proceeding
*   Deploy Cloud Functions (Environment variables for Gemini API Key).
*   Define Firestore Indexes.

**Phase 2: Admin Web Portal**
*   Port existing React code to Next.js.
*   Replace LocalStorage logic in `db.ts` with Firestore SDK calls.
*   Implement Firebase Auth.

**Phase 3: Flutter Mobile App**
*   Setup Flutter project with `firebase_core`. (Check with the Human)
*   Implement "Clean Architecture" folder structure.
*   Build UI: Copy the Tailwind design into Flutter Widgets (`Container`, `Column`, `ListView`).
*   Implement `url_launcher` for Calls/WhatsApp.



---

## 6. Security & Compliance
*   **API Keys:** No API keys (Gemini/Firebase Admin) shall exist in the Frontend code (Web or Mobile). All sensitive operations must route through Cloud Functions.
*   **GDPR/Privacy:** Constituent data is sensitive. Firestore rules must restrict read access only to authenticated users with `STAFF` or `LEADER` roles.
