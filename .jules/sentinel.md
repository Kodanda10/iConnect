## 2025-02-12 - Hardcoded API Key in Firebase Options
**Vulnerability:** Found a hardcoded Firebase API key ('AIzaSyAygMgePqu-C__yOoqDyqFHgnJ5Snr4Ic8') in `lib/firebase_options.dart`.
**Learning:** Hardcoding API keys in configuration files exposes them in version control and potentially to end-users via decompilation or repository access.
**Prevention:** Use `String.fromEnvironment('FIREBASE_API_KEY')` in Dart to inject secrets at build time via the `--dart-define` flag instead of committing them.
