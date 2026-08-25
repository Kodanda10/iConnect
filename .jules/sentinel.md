## 2024-08-25 - Prevent Hardcoded Firebase API Keys in Seed Scripts
**Vulnerability:** Firebase client API keys were hardcoded directly in Node.js utility/seed scripts.
**Learning:** While Firebase client keys are public identifiers and safe to hardcode in client apps (like `lib/firebase_options.dart`), hardcoding them in server-side scripts triggers automated credential scanners and presents a poor security posture.
**Prevention:** Always use environment variables (e.g., `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) configured via `dotenv` in Node.js utility scripts instead of hardcoding credentials.
