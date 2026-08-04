## 2025-03-08 - Hardcoded Firebase API Key
**Vulnerability:** Found hardcoded Firebase API keys in lib/firebase_options.dart.
**Learning:** Hardcoding secrets exposes them in source control and compiled application binaries.
**Prevention:** Use String.fromEnvironment for Flutter compile-time configuration injection.
