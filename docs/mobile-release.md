# Mobile App Release Guide

> **Version**: 1.0.0  
> **Last Updated**: 2025-12-17

---

## Android Release Process

### Prerequisites

1. **Keystore Setup**

```bash
# Generate release keystore (one-time)
keytool -genkey -v -keystore ~/iconnect-release.keystore \
  -alias iconnect-key \
  -keyalg RSA -keysize 2048 -validity 10000

# Store credentials securely
# keystore password: [REDACTED]
# key password: [REDACTED]
```

2. **Configure Signing**

**`android/key.properties`** (gitignored)
```properties
storePassword=<keystore-password>
keyPassword=<key-password>
keyAlias=iconnect-key
storeFile=/Users/abhijita/iconnect-release.keystore
```

**`android/app/build.gradle`** (already configured)
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

---

### Build Release APK/AAB

```bash
# Clean build
flutter clean
flutter pub get

# Build Android App Bundle (for Play Store)
flutter build appbundle --release

# Build APK (for direct distribution)
flutter build apk --release --split-per-abi

# Outputs:
# - build/app/outputs/bundle/release/app-release.aab
# - build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk
# - build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
# - build/app/outputs/flutter-apk/app-x86_64-release.apk
```

---

### Google Play Store Submission

#### 1. Play Console Setup

- **App Name**: iConnect CRM
- **Package Name**: `com.iconnect.mobile`
- **Category**: Productivity
- **Content Rating**: Everyone
- **Privacy Policy URL**: [Required]

#### 2. Store Listing

**Short Description** (80 chars):
```
Constituent relationship management for political representatives
```

**Full Description** (4000 chars):
```
iConnect CRM helps political representatives manage constituent relationships 
efficiently. Track birthdays, anniversaries, meetings, and communications 
all in one place.

Features:
• Birthday and anniversary reminders
• Conference call scheduling
• Task management with AI-powered greetings
• Real-time data sync across devices
• Secure role-based access control

Designed for Indian political leaders and their staff to stay connected 
with constituents.
```

**Screenshots** (Required):
- Home screen (task list)
- Report tab
- Meeting scheduler
- AI greeting composer
- Settings

#### 3. App Releases

**Internal Testing** → **Closed Testing** → **Open Testing** → **Production**

```bash
# Upload AAB
# Play Console → Release → Production → Create Release
# Upload: build/app/outputs/bundle/release/app-release.aab

# Release Notes (v1.6.0)
What's New:
- Added Report tab for action history
- Meeting scheduler with conference call support
- AI-powered greeting composer
- Enhanced security and performance
```

#### 4. Staged Rollout

| Day | Percentage | Action |
|-----|------------|--------|
| 1 | 5% | Monitor crashes |
| 3 | 20% | Check reviews |
| 5 | 50% | Verify performance |
| 7 | 100% | Full release |

---

## iOS Release Process (Future)

### Prerequisites

1. **Apple Developer Account**: $99/year
2. **Provisioning Profiles**: Created in Apple Developer Portal
3. **Certificates**: Distribution certificate for App Store

### Build Steps

```bash
# Build iOS archive
flutter build ios --release

# Open in Xcode
open ios/Runner.xcworkspace

# Xcode → Product → Archive
# Upload to App Store Connect
```

### App Store Submission

Similar process to Play Store, but via App Store Connect.

---

## Version Management

### Versioning Strategy: Semantic Versioning

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (2.0.0)
- **MINOR**: New features (1.6.0)
- **PATCH**: Bug fixes (1.5.1)

### Update `pubspec.yaml`

```yaml
version: 1.6.0+6  # version+buildNumber
```

**Build Number**: Increment for every release (Play Store requirement)

---

## Crashlytics Setup

### 1. Add Firebase Crashlytics

```bash
# Add dependencies
flutter pub add firebase_crashlytics

# Configure
flutterfire configure
```

**`lib/main.dart`**
```dart
import 'package:firebase_crashlytics/firebase_crashlytics.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  
  // Enable Crashlytics
  FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterError;
  
  runApp(const MyApp());
}
```

### 2. Track Custom Events

```dart
try {
  // Risky operation
} catch (e, stackTrace) {
  await FirebaseCrashlytics.instance.recordError(e, stackTrace);
}
```

---

## Release Checklist

### Pre-Release

- [ ] All tests passing (flutter test)
- [ ] flutter analyze shows no issues
- [ ] Version bumped in pubspec.yaml
- [ ] CHANGELOG.md updated
- [ ] Firebase config verified (production project)
- [ ] Keystore accessible
- [ ] No debug/demo code in release build

### Build

- [ ] Clean build (flutter clean)
- [ ] AAB built successfully
- [ ] APK variants built (armeabi-v7a, arm64-v8a)
- [ ] File sizes acceptable (<50MB)

### Testing

- [ ] Install on physical device
- [ ] Login flow works
- [ ] Task list loads
- [ ] Report tab displays data
- [ ] Meeting scheduler works
- [ ] AI greeting generates messages
- [ ] No crashes or ANRs

### Submission

- [ ] Play Console listing updated
- [ ] Screenshots uploaded (5+ required)
- [ ] Privacy policy URL added
- [ ] Release notes written
- [ ] AAB uploaded
- [ ] Staged rollout configured (5% start)

### Post-Release

- [ ] Monitor Crashlytics for crashes
- [ ] Check Play Console for reviews
- [ ] Verify download/install metrics
- [ ] Respond to user feedback

---

## Rollback Procedure

### Play Console Rollback

1. **Immediate Halt**
   - Play Console → Release → Production
   - **Halt Rollout** (stops at current %)

2. **Promote Previous Version**
   - Go to previous release
   - **Re-release** to 100%

3. **Notify Users**
   - Update release notes
   - Announce via in-app message (next release)

### Timeline

- **Detection**: < 1 hour (Crashlytics alerts)
- **Decision**: < 2 hours (review crash rate)
- **Rollback**: < 4 hours (promote previous version)

---

## Store Compliance

### Google Play Policies

**Required:**
- [ ] Privacy Policy URL
- [ ] Data Safety form completed
- [ ] Target API level 33+ (Android 13)
- [ ] 64-bit support (arm64-v8a)

**Prohibited:**
- ❌ Misleading claims
- ❌ User data misuse
- ❌ Malware/viruses

### Data Safety Form

**Data Collected:**
- Email address (Authentication)
- Name, phone number (Constituent data)
- Location (Block/GP/ULB)

**Data Sharing:**
- Shared with Firebase (analytics)
- Not sold to third parties

**Security:**
- Data encrypted in transit (TLS)
- Data encrypted at rest (Firestore)

---

## CI/CD Integration

### GitHub Actions (Android)

```yaml
# .github/workflows/release.yml
name: Android Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'
      
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.32.7'
      
      - name: Decode Keystore
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/app/keystore.jks
      
      - name: Build AAB
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
        run: flutter build appbundle --release
      
      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT }}
          packageName: com.iconnect.mobile
          releaseFiles: build/app/outputs/bundle/release/app-release.aab
          track: internal
```

---

## Monitoring Post-Release

### Key Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Crash-free rate | >99% | <98% |
| ANR rate | <0.5% | >1% |
| Install success rate | >95% | <90% |
| 1-day retention | >70% | <60% |

### Tools

- **Crashlytics**: Real-time crash reports
- **Play Console Vitals**: ANR, crash rates
- **Firebase Analytics**: User engagement
- **Play Console Reviews**: User feedback
