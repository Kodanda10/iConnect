import {scanForTasks, Constituent} from "../dailyScan";

describe("dailyScan Logic", () => {
  const mockTimestampClass = {
    fromDate: (date: Date) => ({
      toDate: () => date,
      toISOString: () => date.toISOString(),
      _isTimestamp: true,
    }),
    now: () => ({
      toDate: () => new Date(),
      _isTimestamp: true,
    }),
  };

  const mockConstituents: Constituent[] = [
    {
      id: "c1",
      name: "Rahul",
      mobile_number: "9876543210",
      dob: "1990-12-18", // matches today (if today is Dec 18)
      ward_number: "12",
      address: "Street 1",
      created_at: "2023-01-01",
    },
  ];

  test("should create task for birthday today", () => {
    // Set fixed date for test
    const today = new Date("2025-12-18T10:00:00Z");
    jest.useFakeTimers().setSystemTime(today);

    const result = scanForTasks(mockConstituents, [], mockTimestampClass);

    expect(result.count).toBe(1);
    expect(result.newTasks[0].constituent_name).toBe("Rahul");
    expect(result.newTasks[0].type).toBe("BIRTHDAY");
    expect(result.newTasks[0].due_date._isTimestamp).toBe(true);

    jest.useRealTimers();
  });

  test("should NOT create duplicate tasks", () => {
    const today = new Date("2025-12-18T10:00:00Z");
    jest.useFakeTimers().setSystemTime(today);

    const existingTask: any = {
      constituent_id: "c1",
      type: "BIRTHDAY",
      due_date: mockTimestampClass.fromDate(today),
    };

    const result = scanForTasks(mockConstituents, [existingTask], mockTimestampClass);

    expect(result.count).toBe(0);

    jest.useRealTimers();
  });
});
