## 2024-12-16 - Prevent Credential Scanner Triggers in Node Scripts
**Vulnerability:** Hardcoded Firebase API keys in Node.js utility and seed scripts (e.g., `src/scripts/*.ts`).
**Learning:** While Firebase client keys are safe in client code (like `lib/firebase_options.dart`), putting them in standalone Node scripts triggers automated credential scanners in this repository.
**Prevention:** Always use `dotenv` and environment variables (e.g., `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) for Firebase config in Node scripts, keeping hardcoded values exclusively in client initialization.
