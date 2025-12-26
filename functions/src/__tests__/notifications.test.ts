
import {determinePushTimes, formatAudioMessage} from "../notifications";

describe("Notification Logic", () => {
  describe("determinePushTimes", () => {
    it("calculates evening before (8 PM) and 10 min before", () => {
      // Test case: Meeting on Dec 18th 10:00 AM
      const scheduled = new Date("2025-12-18T10:00:00+05:30"); // IST
      const result = determinePushTimes(scheduled);

      // Verify evening before: 8:00 PM local time
      expect(result.eveningBefore.getHours()).toBe(20);
      expect(result.eveningBefore.getMinutes()).toBe(0);

      // Verify 10 min before: exactly 10 min relative to scheduled
      const diffMs = result.tenMinBefore.getTime() - scheduled.getTime();
      expect(diffMs).toBe(-10 * 60 * 1000);
    });
  });

  describe("formatAudioMessage", () => {
    it("formats Hindi message correctly", () => {
      const details = {dialInNumber: "1800-123", accessCode: "9999"};
      const msg = formatAudioMessage(details, "HINDI");
      expect(msg).toContain("Dial: 1800-123");
      expect(msg).toContain("Code: 9999");
      expect(msg).toContain("कृपया"); // Hindi keyword
    });

    it("formats Odia message correctly", () => {
      const details = {dialInNumber: "1800-123", accessCode: "9999", lang: "ODIA" as const};
      const msg = formatAudioMessage(details, "ODIA");
      expect(msg).toContain("ଦୟାକରି"); // Odia keyword
    });
  });
});
