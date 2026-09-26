## 2024-09-26 - Hardcoded API Key in Flutter Firebase Config
**Vulnerability:** Hardcoded Firebase API key found in lib/firebase_options.dart across multiple platform configs (web, android, ios).
**Learning:** flutterfire configure generates firebase_options.dart with hardcoded keys by default, creating a persistent risk of committing secrets when setting up Flutter/Firebase projects.
**Prevention:** Always use String.fromEnvironment('VARIABLE_NAME') for Dart configuration files to read from the environment at build time while maintaining const constructor compatibility.
