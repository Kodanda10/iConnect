"use strict";
/**
 * @file generateTasksForDateRange.ts
 * @description Production-ready task generation from constituents
 *
 * Features:
 * - Date range support (for APK testing and backfill)
 * - Idempotency (safe to re-run)
 * - Comprehensive metrics
 * - Error handling
 * - Denormalized constituent data on tasks
 *
 * @changelog
 * - 2025-12-26: Initial TDD implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTasksForDateRange = generateTasksForDateRange;
const uuid_1 = require("uuid");
/**
 * Parse date string (YYYY-MM-DD) and extract month/day
 * Returns null if invalid
 */
function parseDateParts(dateStr) {
    if (!dateStr || typeof dateStr !== 'string')
        return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3)
        return null;
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }
    return { month, day };
}
/**
 * Check if a date string matches a target date (month and day only, ignoring year)
 */
function isDateMatchForTarget(dateStr, targetMonth, targetDay) {
    const parts = parseDateParts(dateStr);
    if (!parts)
        return false;
    return parts.month === targetMonth && parts.day === targetDay;
}
/**
 * Format date as YYYY-MM-DD string
 */
function formatDateStr(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * Generate a unique task key for deduplication
 */
function getTaskKey(constituentId, type, dueDateStr) {
    return `${constituentId}:${type}:${dueDateStr}`;
}
/**
 * Create a new task with denormalized constituent data
 */
function createTask(constituent, type, dueDate, TimestampClass) {
    return {
        id: (0, uuid_1.v4)(),
        constituent_id: constituent.id,
        constituent_name: constituent.name || 'Unknown',
        constituent_mobile: constituent.mobile_number || '',
        ward_number: constituent.ward_number || '',
        block: constituent.block || '',
        gram_panchayat: constituent.gram_panchayat || '',
        type,
        due_date: TimestampClass.fromDate(dueDate),
        status: 'PENDING',
        created_at: TimestampClass.now(),
        call_sent: false,
        sms_sent: false,
        whatsapp_sent: false,
    };
}
/**
 * Generate all dates in a range (inclusive)
 */
function* dateRange(start, end) {
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    while (current <= endDate) {
        yield new Date(current);
        current.setDate(current.getDate() + 1);
    }
}
/**
 * Build a set of existing task keys for O(1) duplicate lookup
 */
function buildExistingTaskKeys(existingTasks) {
    const keys = new Set();
    for (const task of existingTasks) {
        let dueDateStr = '';
        // Handle Firestore Timestamp
        if (task.due_date && typeof task.due_date.toDate === 'function') {
            dueDateStr = formatDateStr(task.due_date.toDate());
        }
        else if (typeof task.due_date === 'string') {
            dueDateStr = task.due_date.split('T')[0]; // Handle ISO string
        }
        const constituentId = task.constituent_id || task.constituentId;
        if (constituentId && task.type && dueDateStr) {
            keys.add(getTaskKey(constituentId, task.type, dueDateStr));
        }
    }
    return keys;
}
/**
 * Generate tasks for all birthdays and anniversaries within a date range
 *
 * Production Features:
 * - Supports arbitrary date ranges for backfill/testing
 * - Idempotent: safely re-runnable
 * - Returns comprehensive metrics
 * - Denormalizes constituent data onto tasks for efficient queries
 *
 * @param constituents - Array of constituents to scan
 * @param existingTasks - Array of existing tasks (for deduplication)
 * @param options - Date range and Timestamp class
 * @returns Result with new tasks and metrics
 */
function generateTasksForDateRange(constituents, existingTasks, options) {
    const { startDate, endDate, TimestampClass } = options;
    const newTasks = [];
    const errors = [];
    let skippedDuplicates = 0;
    let birthdayCount = 0;
    let anniversaryCount = 0;
    // Build existing task lookup for O(1) deduplication
    const existingTaskKeys = buildExistingTaskKeys(existingTasks);
    // Iterate through each date in range
    for (const date of dateRange(startDate, endDate)) {
        const targetMonth = date.getMonth() + 1; // 1-indexed
        const targetDay = date.getDate();
        const dueDateStr = formatDateStr(date);
        // Scan all constituents for this date
        for (const constituent of constituents) {
            // Check Birthday
            if (isDateMatchForTarget(constituent.dob, targetMonth, targetDay)) {
                const key = getTaskKey(constituent.id, 'BIRTHDAY', dueDateStr);
                if (existingTaskKeys.has(key)) {
                    skippedDuplicates++;
                }
                else {
                    const task = createTask(constituent, 'BIRTHDAY', date, TimestampClass);
                    newTasks.push(task);
                    existingTaskKeys.add(key); // Add to set to prevent duplicates in same run
                    birthdayCount++;
                }
            }
            // Check Anniversary
            if (isDateMatchForTarget(constituent.anniversary, targetMonth, targetDay)) {
                const key = getTaskKey(constituent.id, 'ANNIVERSARY', dueDateStr);
                if (existingTaskKeys.has(key)) {
                    skippedDuplicates++;
                }
                else {
                    const task = createTask(constituent, 'ANNIVERSARY', date, TimestampClass);
                    newTasks.push(task);
                    existingTaskKeys.add(key);
                    anniversaryCount++;
                }
            }
        }
    }
    return {
        newTasks,
        count: newTasks.length,
        skippedDuplicates,
        birthdayCount,
        anniversaryCount,
        dateRange: {
            start: formatDateStr(startDate),
            end: formatDateStr(endDate),
        },
        errors,
    };
}
//# sourceMappingURL=generateTasksForDateRange.js.map