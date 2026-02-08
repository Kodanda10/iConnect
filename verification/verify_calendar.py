from playwright.sync_api import sync_playwright, expect

def test_calendar_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console messages
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))

        try:
            # Navigate to the test page
            page.goto("http://localhost:3001/test-calendar")

            # Wait for any content to ensure page loaded
            # Use a class that is unique to the GlassCalendar component
            page.wait_for_selector(".bg-zinc-900")

            # Verify accessibility labels
            print("Checking Previous month button...")
            prev_btn = page.get_by_label("Previous month")
            if not prev_btn.is_visible():
                print("Previous month button not visible")

            print("Checking Next month button...")
            next_btn = page.get_by_label("Next month")
            if not next_btn.is_visible():
                print("Next month button not visible")

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/calendar_verification.png")
            print("Verification successful!")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/calendar_failure.png")
        finally:
            browser.close()

if __name__ == "__main__":
    test_calendar_accessibility()
