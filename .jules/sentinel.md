## 2024-12-18 - XSS in PDF Generation via document.write
**Vulnerability:** Cross-Site Scripting (XSS) in `downloadConstituentsAsPDF` where unsanitized constituent data was concatenated into an HTML string and rendered using `document.write`.
**Learning:** Generating "PDFs" by writing HTML to an `about:blank` window using `document.write` inherits the opener's origin, making it susceptible to XSS if user-controlled fields (like constituent names) contain malicious payloads.
**Prevention:** Always sanitize (e.g., HTML-escape) any dynamic user input before embedding it into HTML strings that will be written to the DOM, even in secondary or print windows.
