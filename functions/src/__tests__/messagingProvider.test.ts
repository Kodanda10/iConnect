/**
 * @file functions/src/__tests__/messagingProvider.test.ts
 * @description TDD tests for plug-and-play messaging provider abstraction
 *
 * This tests our "bridge" - the abstraction layer that will seamlessly
 * integrate with real providers (Twilio, MSG91, Meta WhatsApp) when ready.
 */

import {MessagingProvider, createMessagingProvider} from "../messagingProvider";

describe("Messaging Provider Abstraction", () => {
  describe("createMessagingProvider", () => {
    it("returns mock provider when SMS_PROVIDER=mock", () => {
      const provider = createMessagingProvider("mock");
      expect(provider.name).toBe("MockProvider");
    });

    it("returns twilio provider when SMS_PROVIDER=twilio", () => {
      const provider = createMessagingProvider("twilio");
      expect(provider.name).toBe("TwilioProvider");
    });

    it("returns msg91 provider when SMS_PROVIDER=msg91", () => {
      const provider = createMessagingProvider("msg91");
      expect(provider.name).toBe("MSG91Provider");
    });

    it("defaults to mock when provider unknown", () => {
      const provider = createMessagingProvider("unknown");
      expect(provider.name).toBe("MockProvider");
    });
  });

  describe("MockProvider", () => {
    let provider: MessagingProvider;

    beforeEach(() => {
      provider = createMessagingProvider("mock");
    });

    it("sendSMS returns success with mock messageId", async () => {
      const result = await provider.sendSMS("+919876543210", "Test message");

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^mock-/);
      expect(result.provider).toBe("MockProvider");
    });

    it("sendWhatsApp returns success with mock messageId", async () => {
      const result = await provider.sendWhatsApp("+919876543210", "greeting_template", {name: "Test"});

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^mock-wa-/);
      expect(result.provider).toBe("MockProvider");
    });

    it("sendBulkSMS processes all recipients", async () => {
      const mobiles = ["+919876543210", "+919876543211", "+919876543212"];
      const results = await provider.sendBulkSMS(mobiles, "Bulk test");

      expect(results.length).toBe(3);
      expect(results.every((r) => r.success)).toBe(true);
    });
  });

  describe("TwilioProvider", () => {
    let provider: MessagingProvider;

    beforeEach(() => {
      provider = createMessagingProvider("twilio");
    });

    it("sendSMS throws when credentials missing", async () => {
      // Without TWILIO_ACCOUNT_SID, should throw
      await expect(provider.sendSMS("+919876543210", "Test"))
          .rejects.toThrow(/credentials/i);
    });
  });

  describe("MSG91Provider", () => {
    let provider: MessagingProvider;

    beforeEach(() => {
      provider = createMessagingProvider("msg91");
    });

    it("sendSMS throws when credentials missing", async () => {
      // Without MSG91_AUTH_KEY, should throw
      await expect(provider.sendSMS("+919876543210", "Test"))
          .rejects.toThrow(/credentials/i);
    });
  });
});
