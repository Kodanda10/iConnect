/**
 * @file __tests__/download.test.ts
 * @description TDD tests for constituent download functionality (CSV, PDF)
 * @changelog
 * - 2024-12-11: Initial TDD tests for download utilities
 */

import { downloadConstituentsAsCSV, generateCSVContent } from '@/lib/utils/download';
import { Constituent } from '@/types';

// Mock browser download behavior
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();

beforeAll(() => {
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
});

beforeEach(() => {
    jest.clearAllMocks();
    // Mock document.createElement and anchor click
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
            return {
                href: '',
                download: '',
                click: mockClick,
                style: {},
            } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Download Utilities', () => {
    const mockConstituents: Constituent[] = [
        {
            id: '1',
            full_name: 'Vikram Gupta',
            phone: '9875460326',
            ward: '16',
            block: 'Raipur',
            gp_ulb: 'GP1',
            birthday_mmdd: '05-23',
            anniversary_mmdd: '10-15',
        },
        {
            id: '2',
            full_name: 'Rajesh Verma',
            phone: '7248215796',
            ward: '19',
            block: 'Bilaspur',
            gp_ulb: 'ULB1',
            birthday_mmdd: '10-13',
            anniversary_mmdd: undefined,
        },
    ];

    describe('generateCSVContent', () => {
        it('should generate CSV string with headers', () => {
            // RED: This test will fail because generateCSVContent doesn't exist yet
            const csv = generateCSVContent(mockConstituents);

            expect(csv).toContain('Name,Mobile,Ward,Block,GP/ULB,Birthday,Anniversary');
        });

        it('should include all constituent data rows', () => {
            const csv = generateCSVContent(mockConstituents);

            expect(csv).toContain('Vikram Gupta,9875460326,16,Raipur,GP1,05-23,10-15');
            expect(csv).toContain('Rajesh Verma,7248215796,19,Bilaspur,ULB1,10-13,');
        });

        it('should handle empty array', () => {
            const csv = generateCSVContent([]);

            expect(csv).toContain('Name,Mobile,Ward,Block,GP/ULB,Birthday,Anniversary');
            // Should only have header row
            expect(csv.split('\n').length).toBe(1);
        });

        it('should escape commas in data fields', () => {
            const constituentsWithCommas: Constituent[] = [
                {
                    id: '3',
                    full_name: 'Kumar, Raj',
                    phone: '1234567890',
                    ward: '5',
                    block: 'Test, Block',
                    gp_ulb: 'GP',
                    birthday_mmdd: '01-01',
                },
            ];

            const csv = generateCSVContent(constituentsWithCommas);

            // Fields with commas should be quoted
            expect(csv).toContain('"Kumar, Raj"');
            expect(csv).toContain('"Test, Block"');
        });
    });

    describe('downloadConstituentsAsCSV', () => {
        it('should create a blob and trigger download', () => {
            // RED: This test will fail because downloadConstituentsAsCSV doesn't exist yet
            downloadConstituentsAsCSV(mockConstituents);

            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(mockClick).toHaveBeenCalled();
            expect(mockRevokeObjectURL).toHaveBeenCalled();
        });

        it('should set correct filename with timestamp', () => {
            const mockAnchor = {
                href: '',
                download: '',
                click: mockClick,
                style: {},
            };

            jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);

            downloadConstituentsAsCSV(mockConstituents);

            expect(mockAnchor.download).toMatch(/constituents_\d{4}-\d{2}-\d{2}\.csv/);
        });
    });
});
