## 2026-05-16 - Hardcoded Firebase API Key
**Vulnerability:** Hardcoded Firebase API key in lib/firebase_options.dart
**Learning:** API keys should never be hardcoded in source control as they can be extracted by malicious actors.
**Prevention:** Use environment variables (e.g., const String.fromEnvironment) to inject sensitive keys at build time.
