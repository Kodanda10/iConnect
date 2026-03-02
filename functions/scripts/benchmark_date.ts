const dateStr = '1990-05-15';
const targetDate = new Date();

console.time('split');
for (let i = 0; i < 1000000; i++) {
    const parts = dateStr.split('-');
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10) - 1;
}
console.timeEnd('split');

console.time('charCodeAt');
for (let i = 0; i < 1000000; i++) {
    // Fast path for YYYY-MM-DD
    if (dateStr.charCodeAt(4) === 45 && dateStr.charCodeAt(7) === 45) {
        // "1990-05-15"
        //  0123456789
        const m1 = dateStr.charCodeAt(5) - 48;
        const m2 = dateStr.charCodeAt(6) - 48;
        const month = m1 * 10 + m2 - 1;

        const d1 = dateStr.charCodeAt(8) - 48;
        const d2 = dateStr.charCodeAt(9) - 48;
        const day = d1 * 10 + d2;
    }
}
console.timeEnd('charCodeAt');
