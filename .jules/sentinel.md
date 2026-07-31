## 2025-12-17 - Hardcoded Firebase API Key
**Vulnerability:** A hardcoded Firebase API key was present in the manually implemented `lib/firebase_options.dart`.
**Learning:** Manual implementations of default configuration files often fail to follow best practices for secret management, even when the generated versions do.
**Prevention:** Always use environment variables for sensitive API keys, especially in client-side applications where source code might be exposed. Utilize `String.fromEnvironment` in Dart.
