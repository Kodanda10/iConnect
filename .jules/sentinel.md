## 2026-08-18 - Hardcoded Firebase API keys in Node Scripts
**Vulnerability:** Firebase API keys were hardcoded in Node utility/seed scripts (e.g., seed-tasks.ts).
**Learning:** While Firebase client API keys are public and fine in client apps (like Flutter's firebase_options.dart), hardcoding them directly into Node scripts triggers automated credential scanners unnecessarily.
**Prevention:** Always replace them with environment variables (e.g., process.env.NEXT_PUBLIC_FIREBASE_API_KEY) in Node utility and seed scripts to avoid scanner alerts and improve security posture.
