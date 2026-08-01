## 2024-08-01 - Hardcoded Firebase API Key in Dart/Flutter
**Vulnerability:** Found hardcoded Firebase API keys in lib/firebase_options.dart.
**Learning:** Hardcoding API keys exposes credentials to reverse engineering and potential abuse.
**Prevention:** Use String.fromEnvironment() to securely read environment variables at compile-time instead of checking in literal API keys.
