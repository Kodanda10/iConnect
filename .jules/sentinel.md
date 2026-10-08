## 2025-02-27 - Remove hardcoded API key
**Vulnerability:** Hardcoded Firebase API Key (`AIzaSyAygMgePqu-C__yOoqDyqFHgnJ5Snr4Ic8`) found in Dart configuration (`lib/firebase_options.dart`) and Node.js seeding scripts.
**Learning:** Hardcoding API keys exposes them in source control and potentially to end-users (in compiled artifacts or client-side bundles).
**Prevention:** Always use environment variables for sensitive configuration secrets (`String.fromEnvironment()` in Dart, `process.env` in Node.js).
