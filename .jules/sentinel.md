# Sentinel's Journal

## 2025-02-18 - Missing Security Headers in Next.js
**Vulnerability:** The memory stated that security headers were enforced in `next.config.ts`, but the file was actually empty, leaving the application vulnerable to Clickjacking and MIME sniffing.
**Learning:** Automated memories or documentation can drift from reality. "Trust but verify" is critical for security auditing.
**Prevention:** Always verify configuration files directly rather than relying on summaries.
