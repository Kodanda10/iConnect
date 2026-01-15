# Sentinel Journal 🛡️

## 2025-02-18 - CSV Formula Injection Vulnerability
**Vulnerability:** The constituent export functionality (`download.ts`) allowed CSV injection (Formula Injection). User input starting with `=`, `+`, `-`, or `@` was exported as-is, which could execute arbitrary code or formulas when opened in spreadsheet software like Microsoft Excel.
**Learning:** CSV export features must strictly sanitize data. Merely escaping commas and quotes is insufficient; active content triggers (formulas) must be neutralized. This is often overlooked because developers assume CSVs are just "text", but Excel interprets them as executable data sources.
**Prevention:** Always prepend a single quote `'` to fields starting with dangerous characters (`=`, `+`, `-`, `@`) before any other CSV escaping (like wrapping in quotes). This forces the spreadsheet software to treat the cell content as a string literal.
