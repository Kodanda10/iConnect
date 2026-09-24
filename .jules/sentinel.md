## 2024-12-18 - Hardcoded Firebase API Key in Dart Configuration
**Vulnerability:** Hardcoded API key found directly in lib/firebase_options.dart.
**Learning:** Hardcoding API keys in configuration files exposes sensitive credentials in version control and potentially the built application binary.
**Prevention:** Always use String.fromEnvironment('VARIABLE_NAME') to retrieve API keys and secrets from environment variables at build time in Dart/Flutter.
