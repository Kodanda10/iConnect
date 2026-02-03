from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_metrics_card(page: Page):
    # 1. Arrange: Go to the upload page where DataMetricsCard is used
    print("Navigating to upload page...")
    page.goto("http://localhost:3000/upload")

    # 2. Act: Wait for the component to render
    # It might show "Loading metrics..." then "Error loading metrics" (due to dummy firebase)
    # or "Total Constituents" if we somehow had data.

    print("Waiting for DataMetricsCard to appear...")
    # We expect either the loading state, error state, or success state.
    # DataMetricsCard uses data-testid="metrics-loading" or "total-count" or error text.

    # Let's wait for ANY of these.
    try:
        # Check for loading first (it appears initially)
        expect(page.get_by_text("Loading metrics...")).to_be_visible(timeout=5000)
        print("Loading state visible.")
    except:
        print("Loading state missed or too fast.")

    # Wait for final state (Error or Success)
    try:
        expect(page.get_by_text("Error loading metrics")).to_be_visible(timeout=5000)
        print("Error state visible (Expected with dummy config).")
    except:
        try:
            expect(page.get_by_test_id("total-count")).to_be_visible(timeout=5000)
            print("Success state visible (Unexpected but good).")
        except:
             print("Neither error nor success state found.")

    # 3. Screenshot
    time.sleep(1) # Wait a bit for animations
    page.screenshot(path="/home/jules/verification/metrics_card.png")
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_metrics_card(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
