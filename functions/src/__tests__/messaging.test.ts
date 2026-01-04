
import * as admin from "firebase-admin";
import {sendPushNotification, sendSMS} from "../messaging";

// Mock Firebase Admin
jest.mock("firebase-admin", () => ({
  messaging: jest.fn().mockReturnValue({
    send: jest.fn().mockResolvedValue("projects/id/messages/123"),
    sendEachForMulticast: jest.fn().mockResolvedValue({successCount: 1, failureCount: 0}),
  }),
}));

describe("Messaging Service", () => {
  describe("sendPushNotification", () => {
    it("sends FCM message to a specific token", async () => {
      const token = "fcm-token-123";
      const title = "Meeting Scheduled";
      const body = "Join now";

      const messageId = await sendPushNotification(token, title, body);

      expect(messageId).toBe("projects/id/messages/123");
      expect(admin.messaging().send).toHaveBeenCalledWith(expect.objectContaining({
        token,
        notification: {title, body},
      }));
    });
  });

  describe("sendSMS", () => {
    it("logs SMS to console (Mock Only)", async () => {
      const mobile = "+919999999999";
      const message = "Hello World";

      const success = await sendSMS(mobile, message);

      expect(success).toBe(true);
      // In real impl, checking console or mock axios
    });
  });
});
