# APEX ADAMANTIUM PROTOCOL - QA Quick Reference Card

**Version**: 1.0 | **Last Updated**: 2025-12-19

---

## 🚀 Quick Commands

```bash
# Full test suite
flutter test

# QA-specific tests only
flutter test test/qa/

# Static analysis (must be 0 issues)
flutter analyze

# Single test file
flutter test path/to/test.dart
```

---

## 🔴 Most Common Test Failures & Fixes

### 1. "Binding has not yet been initialized"

**Symptom**: `ServicesBinding.instance` throws before binding initialization  
**Cause**: `GoogleFonts` or asset loading called before `TestWidgetsFlutterBinding.ensureInitialized()`  

**Fix**: Already handled globally in `test/flutter_test_config.dart`. If still occurring:
```dart
// Add to test file main() if needed (should be rare)
void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  // tests...
}
```

### 2. "Timer is still pending after widget tree disposed"

**Symptom**: Animation/timer tests fail with pending timers  
**Cause**: `Future.delayed()` is not cancellable  

**Fix**: Use `Timer` instead:
```dart
// BAD - not cancellable
Future.delayed(Duration(seconds: 2), () => callback());

// GOOD - cancellable
Timer? _timer;
_timer = Timer(Duration(seconds: 2), () => callback());
// In dispose(): _timer?.cancel();
```

### 3. "RenderFlex overflowed"

**Symptom**: Yellow/black striped overflow bars  
**Fix**: Wrap in `Expanded`, `Flexible`, or `SingleChildScrollView`

### 4. Mock Not Matching Query

**Symptom**: `MissingStubError` for Firestore queries  
**Fix**: Add all query parameters to mock including `isLessThan`:
```dart
when(() => mockCollection.where(
  any(),
  isEqualTo: any(named: 'isEqualTo'),
  isGreaterThanOrEqualTo: any(named: 'isGreaterThanOrEqualTo'),
  isLessThan: any(named: 'isLessThan'), // Don't forget!
)).thenReturn(mockQuery);
```

---

## 📊 Test Suite Structure

| Suite | Tests | Purpose |
|---|---|---|
| Unit (BLoC) | `test/features/*/` | Business logic |
| Layout Defense | `test/qa/layout_overflow_test.dart` | RenderFlex prevention |
| Design Parity | `test/qa/design_token_parity_test.dart` | Flutter ↔ Web CSS |
| Infra Integrity | `test/qa/test_infra_integrity_test.dart` | Binding/asset validation |

---

## ✅ Pre-Commit Checklist

- [ ] `flutter analyze` returns 0 issues
- [ ] `flutter test` all green
- [ ] No `print()` statements in production code
- [ ] No API keys in code/logs
