## 2025-01-20 - Hardcoded Secrets in Config
**Vulnerability:** Found hardcoded Firebase API keys in lib/firebase_options.dart for all platforms.
**Learning:** Hardcoded credentials are a critical security risk as they can be easily extracted from public repositories or compiled applications, potentially allowing unauthorized access to the backend infrastructure.
**Prevention:** Always use environment variables, secure secret managers, or build-time injection (like String.fromEnvironment in Dart) to handle sensitive credentials instead of hardcoding them in the source code.
