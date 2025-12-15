import { scanForTasks, Constituent, Task } from '../dailyScan';

describe('Daily Scan Logic', () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const mockConstituents: Constituent[] = [
    {
      id: '1',
      name: 'John Doe',
      mobile_number: '1234567890',
      dob: todayStr, // Birthday Today
      ward_number: '1',
      address: 'Test Addr',
      created_at: '',
    },
    {
      id: '2',
      name: 'Jane Doe',
      mobile_number: '0987654321',
      dob: '2000-01-01', // Birthday Passed
      anniversary: tomorrowStr, // Anniversary Tomorrow
      ward_number: '2',
      address: 'Test Addr',
      created_at: '',
    }
  ];

  it('should create tasks for today and tomorrow', () => {
    const existingTasks: Task[] = [];

    const result = scanForTasks(mockConstituents, existingTasks);

    expect(result.count).toBe(2);
    expect(result.newTasks.length).toBe(2);

    const todayTask = result.newTasks.find(t => t.due_date === todayStr);
    expect(todayTask).toBeDefined();
    expect(todayTask?.type).toBe('BIRTHDAY');
    expect(todayTask?.constituent_id).toBe('1');

    const tomorrowTask = result.newTasks.find(t => t.due_date === tomorrowStr);
    expect(tomorrowTask).toBeDefined();
    expect(tomorrowTask?.type).toBe('ANNIVERSARY');
    expect(tomorrowTask?.constituent_id).toBe('2');
  });

  it('should not duplicate existing tasks', () => {
    const existingTasks: Task[] = [
      {
        id: 'existing-1',
        constituent_id: '1',
        type: 'BIRTHDAY',
        due_date: todayStr,
        status: 'PENDING',
        created_at: '',
      }
    ];

    const result = scanForTasks(mockConstituents, existingTasks);

    // Only the anniversary task (Constituent 2) should be created
    expect(result.count).toBe(1);
    expect(result.newTasks[0].constituent_id).toBe('2');
  });

  it('should handle undefined anniversary dates', () => {
    const constWithNoAnn = [{ ...mockConstituents[0], anniversary: undefined }];
    const result = scanForTasks(constWithNoAnn, []);

    // Should still create birthday task
    expect(result.count).toBe(1);
    expect(result.newTasks[0].type).toBe('BIRTHDAY');
  });
});
