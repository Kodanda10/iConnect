/**
 * Test script for CSV parsing logic
 * Run with: node test-csv-parsing.js
 */

const fs = require('fs');
const path = require('path');

// Read the actual CSV file
const csvPath = path.join(__dirname, '..', 'constituent_data.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

console.log('=== CSV Content (first 500 chars) ===');
console.log(csvContent.substring(0, 500));
console.log('');

// The parseDDMMYYYY function from UploadPage
const parseDDMMYYYY = (dateStr) => {
    if (!dateStr) return undefined;
    // Check if already YYYY-MM-DD
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;

    // Handle DD/MM/YYYY or DD-MM-YYYY
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
        const [d, m, y] = parts;
        // Ensure padding
        const day = d.padStart(2, '0');
        const month = m.padStart(2, '0');
        return `${y}-${month}-${day}`;
    }
    return undefined;
};

// Test parseDDMMYYYY with known values
console.log('=== Testing parseDDMMYYYY ===');
const testCases = [
    '18/12/1990',
    '19/12/2020',
    '18/12/2018',
    '',
    undefined,
    '2020-12-19', // Already ISO
];

testCases.forEach(tc => {
    console.log(`  "${tc}" => "${parseDDMMYYYY(tc)}"`);
});
console.log('');

// Parse CSV like UploadPage does
const parseCsvToRows = (content) => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    console.log('=== Headers (lowercased) ===');
    console.log(headers);
    console.log('');

    const rows = [];

    for (let i = 1; i < lines.length && i <= 3; i++) { // Just first 3 rows for testing
        // Trim and remove surrounding quotes
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row = {};

        console.log(`=== Row ${i} raw values ===`);
        console.log(values);

        headers.forEach((header, index) => {
            const value = values[index] || '';
            // Map common header variations (headers are lowercased)
            if (header === 'name' || header === 'full_name' || header === 'fullname') {
                row.name = value;
            } else if (header === 'mobile' || header === 'mobile_number' || header === 'phone') {
                row.mobile = value;
            } else if (header === 'whatsapp' || header === 'whatsapp_number') {
                row.whatsapp = value;
            } else if (header === 'dob' || header === 'date_of_birth' || header === 'birthday') {
                // Parse DD/MM/YYYY to YYYY-MM-DD immediately
                row.dob = parseDDMMYYYY(value) || value;
            } else if (header === 'anniversary') {
                // Parse DD/MM/YYYY to YYYY-MM-DD immediately
                row.anniversary = parseDDMMYYYY(value) || value;
            } else if (header === 'block') {
                row.block = value;
            } else if (header === 'gp_ulb' || header === 'gp' || header === 'ulb' || header === 'gp/ulb') {
                row.gp_ulb = value;
            } else if (header === 'ward' || header === 'ward_number') {
                row.ward = value;
            }
        });

        console.log(`=== Row ${i} parsed ===`);
        console.log(row);
        console.log('');

        rows.push(row);
    }

    return rows;
};

const rows = parseCsvToRows(csvContent);

console.log('=== Final parsed rows (first 3) ===');
rows.forEach((row, i) => {
    console.log(`Row ${i + 1}: dob="${row.dob}", anniversary="${row.anniversary}", gp_ulb="${row.gp_ulb}"`);
});

// Assertions
let passed = 0;
let failed = 0;

const assert = (condition, msg) => {
    if (condition) {
        console.log(`✅ PASS: ${msg}`);
        passed++;
    } else {
        console.log(`❌ FAIL: ${msg}`);
        failed++;
    }
};

console.log('\n=== Assertions ===');
assert(rows[0].dob === '1990-12-18', 'Row 1 dob should be 1990-12-18');
assert(rows[0].anniversary === '2018-12-18', 'Row 1 anniversary should be 2018-12-18');
assert(rows[0].gp_ulb === 'Jaraka', 'Row 1 gp_ulb should be Jaraka');
assert(rows[1].dob === '1985-12-18', 'Row 2 dob should be 1985-12-18');
assert(rows[1].anniversary === undefined || rows[1].anniversary === '', 'Row 2 anniversary should be empty');

console.log(`\n=== Summary: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
