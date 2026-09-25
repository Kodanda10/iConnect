## 2024-05-18 - Hardcoded Firebase API Key
**Vulnerability:** Firebase API key was hardcoded in `lib/firebase_options.dart`.
**Learning:** Hardcoding credentials in source files exposes them to anyone with repository access. In Flutter/Dart, secrets must be provided at build time using `String.fromEnvironment()`.
**Prevention:** Always use environment variables or build-time configuration injected via CI/CD for API keys instead of committing them in plaintext.
