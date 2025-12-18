# MASTER QA AUDIT PROMPT — “APEX ADAMANTIUM PROTOCOL v1.0”
## Global Benchmark for Production-Grade Flutter Apps (iConnect)

**Role:** Lead QA Architect
**Date:** 2024-12-18
**Status:** **CRITICAL FAIL (SHIPMENT BLOCKED)**

---

### 0) META-LAYER: PRE-FLIGHT “OPERATING ROOM”

**0.1 Build Configuration**
- **Status: FAIL**
- **Findings:**
  - Android Build (`.github/workflows/ci.yml`): Builds `apk --debug`. **Violation**: Must be `release`.
  - Obfuscation: Not enabled in `android/app/build.gradle.kts`. No `minifyEnabled true`. **Violation**.
  - Signing: Release build uses `signingConfigs.getByName("debug")`. **Critical Security Risk**.
  - Dependency Pinning (`pubspec.yaml`): Uses caret syntax (e.g., `^3.8.1`), allowing floating versions. **Violation**.

**0.2 Test Artifact Contract**
- **Status: FAIL**
- **Findings:**
  - No `flutter_driver` or integration test suite found.
  - No automated screenshot generation (Golden tests) configured in CI.
  - No device farm integration (AWS Device Farm, Firebase Test Lab) in CI pipeline.

---

### 1) LAYOUT DEFENSE: “ZERO-TOLERANCE”

**1.1 Viewport Torture Chamber**
- **Status: HIGH RISK (Static Analysis)**
- **Findings:**
  - `lib/features/home/presentation/pages/home_page.dart`: Contains `SingleChildScrollView` wrapping complex layouts. If `ListView` is nested here without `shrinkWrap: true` (performance killer) or proper Sliver constraints, it will throw `Vertical viewport was given unbounded height`.
  - `lib/features/ticker/presentation/widgets/liquid_ticker_widget.dart`: Uses `ListView` potentially inside constrained widgets.

**1.2 Structure Stress**
- **Status: FAIL**
- **Findings:**
  - Project Root: Chaotic mixture of Flutter mobile code and React web prototype files (`App.tsx`, `vite.config.ts`, `package.json` at root). This creates confusion for build tools and developers.

---

### 2) PERFORMANCE: FRAME BUDGET, MEMORY, THERMAL

**2.1 Image Optimization**
- **Status: FAIL**
- **Findings:**
  - `lib/features/home/presentation/pages/home_page.dart`: Uses `Image.network()` without `cacheWidth` or `cacheHeight`.
  - **Impact**: Will decode full-resolution images into memory. On high-density screens (Pixel 7 Pro, iPhone 14 Pro), this will cause massive heap spikes, GC thrashing, and frame drops (Jank).

**2.2 Memory Discipline**
- **Status: PASS**
- **Findings:**
  - `dispose()` is correctly called in all surveyed StatefulWidgets (`LiquidTickerWidget`, `AiGreetingSheet`, `HomePage`).

---

### 3) DIGITAL TWIN VISUAL FIDELITY (Web ↔ Flutter parity)

**3.1 Theme Consistency**
- **Status: FAIL**
- **Findings:**
  - **Glass Surface Mismatch**:
    - Web (`globals.css`): `rgba(255, 255, 255, 0.12)` (Frosted Light)
    - Mobile (`app_theme.dart`): `Color(0x66000000)` (Smoked Dark - ~40% Black)
    - **Result**: The mobile app looks like a "Dark Mode" fork rather than a twin.
  - **Theme Logic**: `AppTheme.lightTheme` forces `Brightness.dark`. This is semantically incorrect and will cause issues if the OS requests a light theme.

---

### 4) MOTION + HAPTICS

**4.1 Haptic Vocabulary**
- **Status: PASS (Partial)**
- **Findings:**
  - `HapticFeedback.lightImpact()` and `mediumImpact()` are present in `HomePage`.

---

### 5) LOGIC + INPUT INTEGRITY

**5.1 Connectivity & Offline**
- **Status: FAIL**
- **Findings:**
  - No explicit connectivity checks found (`Connectivity` package not used).
  - No "Offline Mode" UI states found.
  - The app assumes a perfect network connection.

---

### 8) SECURITY + PRIVACY

**8.1 Secrets & PII Leak Audit**
- **Status: FAIL**
- **Findings:**
  - `lib/core/services/fcm_service.dart`: Uses `debugPrint` to log notification bodies and data payloads (`message.notification!.body`).
  - **Risk**: PII (names, dates, message content) will be visible in system logs (`logcat`), accessible to any app with generic log permissions on older Android versions, or via physical access.

**8.2 Linting & Static Analysis**
- **Status: FAIL**
- **Findings:**
  - `analysis_options.yaml`: Sets `avoid_print`, `prefer_const_constructors`, and `use_build_context_synchronously` to `ignore`.
  - **Impact**: Disables the most critical safety checks provided by the Dart analyzer.

---

### 9) ACCESSIBILITY

**9.1 Screen Reader Symphony**
- **Status: CRITICAL FAIL**
- **Findings:**
  - **Zero** `Semantics` widgets found in the codebase.
  - Custom widgets (like `GlassCard`, `LiquidTicker`) likely provide no context to VoiceOver/TalkBack users.

---

### 12) FINAL SCORECARD

| Domain | Metric | Result | Target | PASS/FAIL |
|---|---:|---:|---:|---|
| **Release** | Build Config | Debug/Unsigned | Release/Signed | **FAIL** |
| **Stability** | Layout Overflows | High Risk | 0 | **FAIL** |
| **Perf** | Image Cache | Unoptimized | Optimized | **FAIL** |
| **Visual** | Digital Twin | Mismatch | Exact Match | **FAIL** |
| **Security** | PII Logging | Leaking | 0 Leaks | **FAIL** |
| **A11y** | Semantics | 0 found | 100% coverage | **FAIL** |
| **Network** | Offline Handling | None | Robust | **FAIL** |

**Certification:** **NO-SHIP**
**Directives:**
1.  **IMMEDIATE**: Enable `flutter_lints` rules and fix all 200+ expected warnings.
2.  **IMMEDIATE**: Remove `debugPrint` of notification payloads.
3.  **HIGH**: Implement `cacheWidth` for all network images.
4.  **HIGH**: Align `AppTheme` colors exactly with `globals.css`.
