
from playwright.sync_api import Page, expect, sync_playwright

def verify_calendar(page: Page):
    # Navigate to the test page
    page.goto("http://localhost:3000/test-calendar")
    page.wait_for_load_state("networkidle")

    # Check if page loaded
    expect(page.get_by_text("Calendar Accessibility Test")).to_be_visible()

    # Inspect ARIA attributes
    # 1. Navigation Buttons
    prev_btn = page.get_by_label("Previous month")
    next_btn = page.get_by_label("Next month")

    expect(prev_btn).to_be_visible()
    expect(next_btn).to_be_visible()
    print("✓ Previous/Next month buttons have aria-labels")

    # 2. Month/Year Dropdowns
    month_btn = page.get_by_label("Select month")
    year_btn = page.get_by_label("Select year")

    expect(month_btn).to_be_visible()
    expect(year_btn).to_be_visible()
    print("✓ Month/Year dropdowns have aria-labels")

    # Check aria-haspopup
    assert month_btn.get_attribute("aria-haspopup") == "true"
    assert year_btn.get_attribute("aria-haspopup") == "true"
    print("✓ Month/Year dropdowns have aria-haspopup")

    # 3. Day buttons
    # Jan 1 2024
    day_btn = page.get_by_role("button", name="Selected: 1 January 2024", exact=True)
    expect(day_btn).to_be_visible()
    print("✓ Selected day has correct aria-label 'Selected: 1 January 2024'")

    # Check another day
    day_2 = page.get_by_role("button", name="2 January 2024", exact=True)
    expect(day_2).to_be_visible()
    print("✓ Unselected day has correct aria-label '2 January 2024'")

    # Check that day_2 does NOT say "Selected"
    assert "Selected" not in (day_2.get_attribute("aria-label") or "")

    # Expand month dropdown
    month_btn.click()
    expect(month_btn).to_have_attribute("aria-expanded", "true")
    print("✓ Month dropdown updates aria-expanded")

    # Take screenshot of open dropdown
    page.screenshot(path="verification/calendar_dropdown.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_calendar(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification/failure.png")
            raise e
        finally:
            browser.close()
