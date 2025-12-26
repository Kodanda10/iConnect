
import {scheduleDailyNotifications, Constituent} from "../dailyScan";
import * as admin from "firebase-admin";

// Mock Firestore
const mockBatch = {
  set: jest.fn(),
  commit: jest.fn().mockResolvedValue(true),
};

const mockDb: any = {
  collection: jest.fn(),
  batch: jest.fn().mockReturnValue(mockBatch),
};

// Mock Settings Response
const mockSettingsPayload = {
  leaderUid: "leader123",
  alertSettings: {
    headsUp: true,
    action: true,
    headsUpMessage: "Tail message",
    actionMessage: "Tail message",
  },
};

// Mock User Response (Leader)
const mockUserPayload = {
  id: "leader123",
  role: "LEADER",
};

const mockCollection = (name: string) => {
  if (name === "settings") {
    return {
      doc: (id: string) => ({
        get: jest.fn().mockResolvedValue({
          data: () => mockSettingsPayload,
        }),
      }),
    };
  }
  if (name === "users") {
    return {
      where: () => ({
        limit: () => ({
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [{id: "leader123", data: () => mockUserPayload}],
          }),
        }),
      }),
      doc: () => ({get: jest.fn()}), // For other calls
    };
  }
  if (name === "scheduled_notifications") {
    return {
      doc: (id: string) => ({
        set: mockBatch.set, // Allow direct set if used without batch
      }),
    };
  }
  return {};
};

mockDb.collection.mockImplementation(mockCollection);

// Mock Timestamp
const mockTimestamp = {
  fromDate: (date: Date) => ({
    toDate: () => date,
    // Mock Firestore Timestamp behavior
  }),
  now: () => ({
    toDate: () => new Date(),
  }),
};
(admin.firestore.Timestamp as any) = mockTimestamp;


describe("scheduleDailyNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should schedule Action (Today) and Heads Up (Tomorrow) with correct dynamic text", async () => {
    // Set Today to Dec 18, 2025
    const today = new Date("2025-12-18T10:00:00Z");
    jest.setSystemTime(today);

    const constituents: Constituent[] = [
      // Birthday Today (Dec 18)
      {id: "1", name: "A", dob: "1990-12-18", mobile_number: "", ward_number: "", address: "", created_at: ""},
      // Anniversary Today (Dec 18)
      {id: "2", name: "B", dob: "1990-01-01", anniversary: "2010-12-18", mobile_number: "", ward_number: "", address: "", created_at: ""},
      // Birthday Tomorrow (Dec 19)
      {id: "3", name: "C", dob: "1990-12-19", mobile_number: "", ward_number: "", address: "", created_at: ""},
    ];

    await scheduleDailyNotifications(mockDb, constituents);

    // Expect 2 notifications
    expect(mockBatch.set).toHaveBeenCalledTimes(2);

    // Check Action Notification (Today)
    // Find Action Call
    const actionCall = mockBatch.set.mock.calls.find((c) => c[1].type === "ACTION_REMINDER");
    expect(actionCall).toBeDefined();
    const actionPayload = actionCall[1];

    // 1 Birthday + 1 Anniversary Today
    expect(actionPayload.body).toContain("1 birthdays & 1 anniversaries today.");
    expect(actionPayload.body).toContain(mockSettingsPayload.alertSettings.actionMessage);

    // Check Time: Today 8:00 AM
    const scheduledDate = actionPayload.scheduledFor.toDate();
    expect(scheduledDate.getHours()).toBe(8);
    expect(scheduledDate.getDate()).toBe(18);

    // Find Heads Up Call
    const headsUpCall = mockBatch.set.mock.calls.find((c) => c[1].type === "HEADS_UP");
    expect(headsUpCall).toBeDefined();
    const headsUpPayload = headsUpCall[1];

    // 1 Birthday Tomorrow
    expect(headsUpPayload.body).toContain("1 birthdays tomorrow."); // No anniversaries
    expect(headsUpPayload.body).not.toContain("&");
    expect(headsUpPayload.body).toContain(mockSettingsPayload.alertSettings.headsUpMessage);

    const headsUpDate = headsUpPayload.scheduledFor.toDate();
    expect(headsUpDate.getHours()).toBe(20); // 8 PM
    expect(headsUpDate.getDate()).toBe(18); // Scheduled FOR today at 8pm
  });

  test("should NOT schedule Action if no events today", async () => {
    const today = new Date("2025-12-18T10:00:00Z");
    jest.setSystemTime(today);

    const constituents: Constituent[] = [
      // Birthday Tomorrow (Dec 19)
      {id: "3", name: "C", dob: "1990-12-19", mobile_number: "", ward_number: "", address: "", created_at: ""},
    ];

    await scheduleDailyNotifications(mockDb, constituents);

    const actionCall = mockBatch.set.mock.calls.find((c) => c[1].type === "ACTION_REMINDER");
    expect(actionCall).toBeUndefined();

    const headsUpCall = mockBatch.set.mock.calls.find((c) => c[1].type === "HEADS_UP");
    expect(headsUpCall).toBeDefined();
    expect(headsUpCall[1].body).toContain("1 birthdays tomorrow.");
  });

  test("should SANITIZE hardcoded clean-up text from templates", async () => {
    const today = new Date("2025-12-18T10:00:00Z");
    jest.setSystemTime(today);

    // Mock Dirty Settings
    const dirtySettings = {
      leaderUid: "leader123",
      alertSettings: {
        headsUp: true,
        action: true,
        headsUpMessage: "Tomorrow's Celebrations! 5 constituents have birthdays tomorrow. Tap to view...",
        actionMessage: "Action Required! Send wishes to 5 people celebrating today. Don't miss...",
      },
    };

    // Override mock for this test
    mockDb.collection.mockImplementation((name: string) => {
      if (name === "settings") {
        return {
          doc: () => ({get: jest.fn().mockResolvedValue({data: () => dirtySettings})}),
        };
      }
      return mockCollection(name); // Use default for others
    });

    const constituents: Constituent[] = [
      {id: "1", name: "A", dob: "1990-12-19", mobile_number: "", ward_number: "", address: "", created_at: ""},
    ];

    await scheduleDailyNotifications(mockDb, constituents);

    const headsUpCall = mockBatch.set.mock.calls.find((c) => c[1].type === "HEADS_UP");
    expect(headsUpCall).toBeDefined();

    // Assert: Dynamic Count (1) represents reality. Hardcoded (5) is removed.
    // Expected: "1 birthdays tomorrow. Tomorrow's Celebrations! Tap to view..."
    const body = headsUpCall[1].body;
    expect(body).toContain("1 birthdays tomorrow.");
    expect(body).not.toContain("5 constituents");
    expect(body).not.toContain("have birthdays tomorrow."); // The hardcoded part
    expect(body).toContain("Tomorrow's Celebrations!");
  });
});
