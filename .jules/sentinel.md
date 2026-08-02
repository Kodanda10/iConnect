## 2025-12-17 - Firebase API Key Hardcoded
**Vulnerability:** Found hardcoded Firebase API keys in lib/firebase_options.dart.
**Learning:** Default Firebase initialization templates often hardcode credentials which can expose sensitive keys if the source code is compromised or if web clients are reverse-engineered.
**Prevention:** Use String.fromEnvironment('FIREBASE_API_KEY') in Dart to safely inject secrets at compile-time via --dart-define rather than hardcoding them in the repository.
