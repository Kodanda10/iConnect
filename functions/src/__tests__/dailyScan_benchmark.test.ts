
import { scanForTasks, Constituent } from '../dailyScan';

describe('dailyScan Performance Benchmark', () => {
    const mockTimestampClass = {
        fromDate: (date: Date) => ({
            toDate: () => date,
            toISOString: () => date.toISOString(),
            _isTimestamp: true
        }),
        now: () => ({
            toDate: () => new Date(),
            _isTimestamp: true
        })
    };

    const generateConstituents = (count: number): Constituent[] => {
        const constituents: Constituent[] = [];
        for (let i = 0; i < count; i++) {
            constituents.push({
                id: `c${i}`,
                name: `Constituent ${i}`,
                mobile_number: '9876543210',
                dob: '1990-01-01', // Fixed date
                anniversary: '2020-01-01', // Fixed date
                ward_number: '1',
                address: 'Address',
                created_at: '2023-01-01'
            });
        }
        return constituents;
    };

    test('measure scanForTasks performance with 100,000 constituents', () => {
        const count = 100000;
        const constituents = generateConstituents(count);

        const start = performance.now();
        scanForTasks(constituents, [], mockTimestampClass);
        const end = performance.now();

        console.log(`scanForTasks with ${count} constituents took: ${(end - start).toFixed(2)}ms`);

        expect(true).toBe(true);
    });
});
