# QA Device Checklist - Manual Suites
**App**: iConnect | **Version**: Review before deploy

---

## Required Devices

| Priority | Device | Purpose | Have? |
|---|---|---|---|
| 1 | iPhone SE/mini | Smallest iOS screen | [ ] |
| 2 | Any Android phone | Main Android coverage | [ ] |
| 3 | iPad (any) | Tablet layout | [ ] |

---

## Suite 4: Motion + Haptics (5 min)

**Build**: `flutter run --release` on physical device

### Checklist
| Test | Pass | Fail | Notes |
|---|---|---|---|
| Tap button → Light haptic | [ ] | [ ] | |
| Pull refresh → Medium haptic | [ ] | [ ] | |
| Error → Heavy haptic | [ ] | [ ] | |
| No "stuck vibration" on rapid taps | [ ] | [ ] | |
| Works after app restart | [ ] | [ ] | |

**Evidence**: Screen recording with finger taps visible (10-20s)

---

## Suite 6: Performance 60fps (10 min)

**Build**: `flutter run --profile`

### Checklist
| Test | Pass | Fail | Notes |
|---|---|---|---|
| Scroll Report page smoothly | [ ] | [ ] | |
| Today tab loads <2s | [ ] | [ ] | |
| Tab switching no jank | [ ] | [ ] | |
| First paint <3s (cold start) | [ ] | [ ] | |
| No memory climb over 5 min | [ ] | [ ] | |

**Evidence**: Note device model, OS version, observations

---

## Suite 9: Accessibility (10 min)

**Setup**: Enable VoiceOver (iOS) or TalkBack (Android)

### Checklist
| Test | Pass | Fail | Notes |
|---|---|---|---|
| All buttons have labels | [ ] | [ ] | |
| Focus order top→bottom logical | [ ] | [ ] | |
| Tap targets ≥44x44pt | [ ] | [ ] | |
| No "unlabeled button" spam | [ ] | [ ] | |
| 200% text scale doesn't break UI | [ ] | [ ] | |
| Actions triggerable via A11y | [ ] | [ ] | |

**Evidence**: 2 screen recordings (VoiceOver + TalkBack) of one primary flow

---

## Suite 10: i18n (if applicable) (5 min)

**Setup**: Device language → Arabic (for RTL)

### Checklist
| Test | Pass | Fail | Notes |
|---|---|---|---|
| Text alignment correct | [ ] | [ ] | |
| No clipped text | [ ] | [ ] | |
| Icons not confusingly mirrored | [ ] | [ ] | |
| Navigation still makes sense | [ ] | [ ] | |

**Evidence**: 5 screenshots of key screens in RTL

---

## Sign-off

**Tester**: _______________  
**Date**: _______________  
**Device(s) Used**: _______________  
**Overall Result**: ☐ PASS  ☐ FAIL (explain below)

Notes:
