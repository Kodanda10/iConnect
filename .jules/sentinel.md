## 2025-12-18 - Fix weak RNG in conference bridge mock
**Vulnerability:** Weak RNG (`Math.random()`) was used to generate access codes and dial-in numbers for mock conference bridges.
**Learning:** Using `Math.random()` makes generated data predictable, which is a security risk for access codes used as authentication.
**Prevention:** Always use cryptographically secure random number generators like `crypto.randomInt()` when generating secrets or authentication codes.
