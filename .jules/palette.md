
## 2024-12-11 - Diagnosing Next.js 'Application Error' Overlays During Visual Verification
**Learning:** When using Playwright to test Next.js local dev routes, unhandled exceptions (like `Firebase: Error (auth/invalid-api-key)`) can manifest purely as generic "Application error: a client-side exception has occurred" screens, masking the real issue.
**Action:** Always inject `page.on("console")` and `page.on("pageerror")` handlers into Playwright verification scripts before calling `page.goto()` to intercept and log the actual browser console output, revealing hidden client-side errors (such as missing mock contexts).
