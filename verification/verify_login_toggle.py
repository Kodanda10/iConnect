from playwright.sync_api import sync_playwright, expect
import time

def test_login_toggle(page):
    print("Navigating to login page...")
    page.goto("http://localhost:3000/login")

    # Wait for the email input to ensure page loaded (loading spinner gone)
    print("Waiting for page load...")
    try:
        page.wait_for_selector("input[type='email']", timeout=30000)
    except:
        print("Timeout waiting for input. Dumping page content...")
        print(page.content())
        raise

    print("Page loaded.")

    # Fill in some dummy data
    page.get_by_label("Email Address").fill("test@example.com")
    page.get_by_label("Password", exact=True).fill("mypassword")

    # Check initial state: type=password
    password_input = page.locator("input#password")
    expect(password_input).to_have_attribute("type", "password")
    print("Initial state confirmed: password hidden.")

    # Find toggle button and click it
    # Note: aria-label changes between "Show password" and "Hide password"
    toggle_btn = page.get_by_label("Show password")
    toggle_btn.click()
    print("Clicked toggle button.")

    # Check state: type=text
    expect(password_input).to_have_attribute("type", "text")
    expect(page.get_by_label("Hide password")).to_be_visible()
    print("State toggled: password shown.")

    # Take screenshot of shown password
    page.screenshot(path="verification/login_shown.png")
    print("Screenshot saved to verification/login_shown.png")

    # Toggle back
    page.get_by_label("Hide password").click()
    expect(password_input).to_have_attribute("type", "password")
    print("State toggled back: password hidden.")

    print("Verification successful!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_login_toggle(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
