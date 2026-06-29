## 2026-06-29 - Fix XSS vulnerability in PDF export
**Vulnerability:** XSS vulnerability when generating PDF exports using unescaped constituent data via document.write().
**Learning:** Directly interpolating user-provided data into HTML strings without sanitization can lead to XSS, especially when written to new browser windows or documents.
**Prevention:** Always escape user input using an HTML entity encoding function (like replacing <, >, etc.) when interpolating values into HTML.
