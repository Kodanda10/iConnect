## 2026-01-08 - Added Security Headers to Next.js Config
**Vulnerability:** Missing HTTP security headers in `iconnect-web` (Next.js), which could leave the application vulnerable to clickjacking, XSS, and other attacks.
**Learning:** `next.config.ts` was empty despite memory suggesting otherwise. Default Next.js setups do not enforce strict security headers.
**Prevention:** Added `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, and `Strict-Transport-Security` to `next.config.ts`.
**Note:** `Permissions-Policy` was omitted intentionally as per memory to avoid breaking meeting features (camera/mic).
