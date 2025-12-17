# Environment Configuration Guide

> **Version**: 1.0.0  
> **Last Updated**: 2025-12-17

---

## Quick Reference

| Environment | Firebase Project | Web URL | Functions Region |
|-------------|------------------|---------|------------------|
| Development | iconnect-dev | localhost:3000 | asia-south1 |
| Staging | iconnect-staging | staging.iconnect.app | asia-south1 |
| Production | iconnect-prod | app.iconnect.app | asia-south1 |

---

## 1. Mobile App (Flutter)

### Configuration Files

| File | Purpose |
|------|---------|
| `lib/firebase_options.dart` | Auto-generated Firebase config |
| `android/app/google-services.json` | Android Firebase config |
| `ios/Runner/GoogleService-Info.plist` | iOS Firebase config |

### Environment Switching

```bash
# Development
flutterfire configure --project=iconnect-dev

# Staging
flutterfire configure --project=iconnect-staging

# Production
flutterfire configure --project=iconnect-prod
```

### Build Commands

```bash
# Development APK
flutter build apk --debug

# Staging APK
flutter build apk --release --dart-define=ENV=staging

# Production APK
flutter build apk --release --dart-define=ENV=production

# Production AAB (Play Store)
flutter build appbundle --release
```

---

## 2. Web Portal (Next.js)

### Configuration Files

| File | Purpose | Committed |
|------|---------|-----------|
| `.env.local` | Local development secrets | ❌ No |
| `.env.staging` | Staging config | ❌ No |
| `.env.production` | Production config | ❌ No |
| `ENV_SETUP.md` | Template for env vars | ✅ Yes |

### Required Environment Variables

```bash
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

### Build Commands

```bash
# Development
npm run dev

# Staging Build
npm run build
# Deploy to Vercel preview

# Production Build
npm run build
# Deploy to Vercel production
```

---

## 3. Cloud Functions (Node.js)

### Configuration

| Method | Purpose |
|--------|---------|
| `firebase functions:config:set` | Runtime config |
| `.runtimeconfig.json` | Local emulator config |
| Environment Variables | CI/CD secrets |

### Deploy Commands

```bash
# Development (emulator)
firebase emulators:start --only functions

# Staging
firebase deploy --only functions --project=iconnect-staging

# Production
firebase deploy --only functions --project=iconnect-prod
```

---

## 4. CI/CD Environment

### GitHub Secrets Required

| Secret Name | Description |
|-------------|-------------|
| `FIREBASE_TOKEN` | Firebase CI token |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web SDK key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |

### Generating Firebase Token

```bash
firebase login:ci
# Copy token to GitHub Secrets
```

---

## 5. Security Checklist

- [ ] `.env*` files in `.gitignore`
- [ ] No hardcoded API keys in source
- [ ] Secrets stored in GitHub Secrets
- [ ] Production Firebase rules deployed
- [ ] Firestore indexes deployed

---

## 6. Quick Verification

```bash
# Verify no secrets in repo
git log -p | grep -i "api_key\|secret\|password" | head -20

# Verify .gitignore
cat .gitignore | grep -E "\.env|secret"
```
