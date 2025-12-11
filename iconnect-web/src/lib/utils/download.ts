/**
 * @file lib/utils/download.ts
 * @description Utilities for downloading constituent data as CSV/PDF
 * @changelog
 * - 2024-12-11: Initial implementation with TDD (GREEN phase)
 */

import { Constituent } from '@/types';

/**
 * Escapes a field value for CSV format
 * If the value contains commas, quotes, or newlines, wrap it in quotes
 */
function escapeCSVField(value: string | undefined): string {
    if (!value) return '';

    // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * Generates CSV content string from constituent data
 */
export function generateCSVContent(constituents: Constituent[]): string {
    const headers = ['Name', 'Mobile', 'Ward', 'Block', 'GP/ULB', 'Birthday', 'Anniversary'];
    const headerRow = headers.join(',');

    if (constituents.length === 0) {
        return headerRow;
    }

    const dataRows = constituents.map((c) => {
        const fields = [
            escapeCSVField(c.full_name || c.name),
            escapeCSVField(c.phone || c.mobile_number),
            escapeCSVField(c.ward || c.ward_number),
            escapeCSVField(c.block),
            escapeCSVField(c.gp_ulb),
            escapeCSVField(c.birthday_mmdd),
            escapeCSVField(c.anniversary_mmdd),
        ];
        return fields.join(',');
    });

    return [headerRow, ...dataRows].join('\n');
}

/**
 * Downloads constituent data as a CSV file
 */
export function downloadConstituentsAsCSV(constituents: Constituent[]): void {
    const csvContent = generateCSVContent(constituents);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    link.download = `constituents_${date}.csv`;

    link.style.display = 'none';
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);
}

/**
 * Opens print dialog for constituent data as a simple PDF-like format
 * Uses browser's native print-to-PDF functionality
 */
export function downloadConstituentsAsPDF(constituents: Constituent[]): void {
    // Create a printable HTML table
    const tableHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Constituent Database</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #008F7A; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #008F7A; color: white; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                tr:hover { background-color: #f1f1f1; }
                .footer { margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>iConnect - Constituent Database</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Ward</th>
                        <th>Block</th>
                        <th>GP/ULB</th>
                        <th>Birthday</th>
                        <th>Anniversary</th>
                    </tr>
                </thead>
                <tbody>
                    ${constituents.map(c => `
                        <tr>
                            <td>${c.full_name || c.name || '-'}</td>
                            <td>${c.phone || c.mobile_number || '-'}</td>
                            <td>${c.ward || c.ward_number || '-'}</td>
                            <td>${c.block || '-'}</td>
                            <td>${c.gp_ulb || '-'}</td>
                            <td>${c.birthday_mmdd || '-'}</td>
                            <td>${c.anniversary_mmdd || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="footer">
                Total Records: ${constituents.length}
            </div>
        </body>
        </html>
    `;

    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(tableHTML);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }
}
