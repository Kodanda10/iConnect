from playwright.sync_api import sync_playwright

def verify_password_toggle():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to login page...")
            page.goto("http://localhost:3000/login")

            print("Waiting for password input...")
            # Use specific placeholder
            page.wait_for_selector('input[placeholder="••••••••"]')

            # Type something
            page.fill('input[placeholder="••••••••"]', "MySecretPass123")

            # Take screenshot before toggle (should be dots)
            page.screenshot(path="verification/1-before-toggle.png")
            print("Screenshot 1 taken.")

            # Click the toggle button
            # We look for the button with aria-label "Show password"
            print("Clicking show password...")
            page.click('button[aria-label="Show password"]')

            # Take screenshot after toggle (should be text)
            page.screenshot(path="verification/2-after-toggle.png")
            print("Screenshot 2 taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_password_toggle()
